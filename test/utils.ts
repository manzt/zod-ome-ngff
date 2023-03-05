import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as url from "node:url";

import * as glob from "glob";

let __dirname = path.dirname(url.fileURLToPath(import.meta.url));
let fixtures = path.join(__dirname, "..", "ngff");

export function globber(version: string) {
  return async (pattern: string) => {
    let files = await glob.glob(
      path.join(fixtures, version, "examples", pattern),
    );
    return files.map((file) => ({
      name: path.basename(file),
      path: file,
      json() {
        return fs.readFile(file, { encoding: "utf-8" }).then(JSON.parse);
      },
    }));
  };
}
