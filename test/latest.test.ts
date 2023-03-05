import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as url from "node:url";

import { describe, expect, test } from "vitest";
import { z } from "zod";
import camelcase from "camelcase";
import * as glob from "glob";

import * as schemas from "../src/latest";

let __dirname = path.dirname(url.fileURLToPath(import.meta.url));

let test_suite_files = await glob.glob(
  path.join(__dirname, "..", "ngff", "latest/tests/*.json"),
);

let Test = z.object({
  formerly: z.string(),
  data: z.any(),
  valid: z.boolean(),
});

let Suite = z.object({
  description: z.string(),
  schema: z.object({
    id: z.string(),
  }),
  tests: z.array(Test),
});

describe.each(
  await Promise.all(
    test_suite_files.map((file) =>
      fs.readFile(file, "utf-8")
        .then(JSON.parse)
        .then(Suite.parse)
    ),
  )
)("$description ($schema.id)", (suite) => { 
  let cased = camelcase(suite.schema.id.split("/").pop()!);
  let name = cased.charAt(0).toUpperCase() + cased.slice(1) as keyof typeof v04;
  let Schema = schemas[name];
  test.each(suite.tests)("$formerly", (test) => {
    expect(Schema.safeParse(test.data).success).toBe(test.valid);
  });
});
