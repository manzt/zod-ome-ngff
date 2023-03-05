// @ts-check
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as url from "node:url";
import * as os from "node:os";

import { z } from "zod";
import camelcase from "camelcase";
import RefParser from "@apidevtools/json-schema-ref-parser";
import { jsonSchemaToZodDereffed } from "json-schema-to-zod";

let __dirname = path.dirname(url.fileURLToPath(import.meta.url));

let VERSIONS = ["0.1", "0.2", "0.3", "0.4", "latest"];

let OVERRIDES = /** @type {const} */ ({
  axes: {
    type: "array",
    items: {
      type: "object",
      properties: {
        name: { type: "string" },
        type: { type: "string" },
        units: { type: "string" },
      },
    },
    required: ["name"],
  },
  coordinateTransformations: {
    type: "array",
    items: {
      anyOf: [
        {
          type: "object",
          properties: {
            type: { type: "string", enum: ["identity"] },
          },
          required: ["type"],
        },
        {
          type: "object",
          properties: {
            type: { type: "string", enum: ["scale"] },
            scale: { type: "array", items: { type: "number" }, minItems: 2 },
          },
          required: ["type", "scale"],
        },
        {
          type: "object",
          properties: {
            type: { type: "string", enum: ["translation"] },
            translation: {
              type: "array",
              items: { type: "number" },
              minItems: 2,
            },
          },
          required: ["type", "translation"],
        },
      ],
    },
  },
});

// A partial schema for the "strict" versions of the NGFF JSON schemas.
// This will ensure our script fails if the "strict" schemas change.
let OmeStrictJSONSchema = z.object({
  $id: z.string(),
  allOf: z.tuple([
    z.object({
      $id: z.string(),
      $schema: z.string(),
      properties: z.object({}),
    }),
    z.object({
      properties: z.object({}),
    }),
  ]),
});

/**
 * @param {Record<string, any>} base
 * @param {Record<string, any>} strict
 */
function inject_additional_required(base, strict) {
  for (let key in strict) {
    if (key === "required") {
      base[key] = (base[key] ?? []).concat(strict[key]);
    } else if (key in base) {
      inject_additional_required(base[key], strict[key]);
    }
  }
}

/**
 * @param {Record<string, any>} base
 * @param {string} version
 */
function inject_overrides(base, version) {
  if (!("$defs" in base)) return;
  console.log(`injecting overrides for: ${base.$id} (${version})`);
  for (let key in base.$defs) {
    if (key in OVERRIDES) {
      console.log("\treplacing:", key);
      base.$defs[key] = OVERRIDES[key];
    }
  }
}

// This is a hack to resolve the "strict" versions of the schemas for json-schema-to-zod
// It relies on the fact that the "strict" schemas are a superset of the non-strict schemas
// and that the "strict" schemas are defined in terms of the non-strict schemas.
//
// Every strict schema has an "allOf" property with two elements, the first of which is
// the non-strict schema and the second of which is the additional properties that are
// required in the strict schema.
//
// This function takes the "strict" schema and resolves the "allOf" property, then
// injects the additional required properties into the non-strict schema.
/** @param {any} schema */
async function deref_strict(schema) {
  let root = await RefParser.dereference(schema);
  OmeStrictJSONSchema.parse(root);
  // @ts-ignore
  let [base, additional_required] = root.allOf;
  inject_additional_required(base, additional_required);
  base["$id"] = root["$id"];
  return base;
}

async function write_package_exports() {
  let pkg = JSON.parse(
    await fs.readFile(path.join(__dirname, "..", "package.json"), {
      encoding: "utf8",
    }),
  );

  pkg.exports = {};

  for (let version of VERSIONS) {
    pkg.exports[version === "latest" ? "." : `./${version}`] = {
      "types": `./dist/${version}.d.ts`,
      "import": `./dist/${version}.js`,
    };
  }

  await fs.writeFile(
    path.join(__dirname, "..", "package.json"),
    JSON.stringify(pkg, null, 2) + os.EOL,
  );
}

/**
 * @param {string} version The ome-ngff version
 * @param {{ where: string }} opts
 */
async function write_module(version, { where }) {
  let sdir = path.resolve(__dirname, "..", "ngff", version, "schemas");
  let entries = await fs.opendir(sdir);

  let schemas = [];
  for await (let dir of entries) {
    if (!dir.isFile()) continue;
    let contents = await fs.readFile(path.resolve(sdir, dir.name), {
      encoding: "utf8",
    });
    let schema = JSON.parse(contents);
    if (schema.$id.includes("strict_")) {
      schema = await deref_strict(schema);
    }
    inject_overrides(schema, version);
    schemas.push(schema);
  }

  let promises = schemas.map(async (schema) => {
    let cased = camelcase(schema.$id.split("/").pop());
    let name = cased.charAt(0).toUpperCase() + cased.slice(1);
    return `export ${await jsonSchemaToZodDereffed(schema, name, false)}`;
  });

  let exports = await Promise.all(promises);

  let module =
    `// This file is generated by scripts/generate-schemas.mjs\nimport { z } from "zod";\n\n${
      exports.join("\n\n")
    }`;

  await fs.writeFile(path.join(where, `${version}.ts`), module);
}

async function main() {
  let src = path.join(__dirname, "..", "src");
  await fs.mkdir(src).catch(() => {});
  for (let version of VERSIONS) {
    await write_module(version, { where: src });
  }
  await write_package_exports();
}

main();
