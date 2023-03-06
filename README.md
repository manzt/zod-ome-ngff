# ome-ngff-schema-zod

[![Node version](https://img.shields.io/npm/v/ome-ngff-schema-zod.svg)](https://www.npmjs.com/package/ome-ngff-schema-zod)
![GitHub Actions](https://github.com/manzt/ome-ngff-schema-zod/actions/workflows/ci.yml/badge.svg)

> **Warning**: here be dragons...

[zod](https://github.com/colinhacks/zod) schemas for
[ome-ngff](https://github.com/ome/ngff). modules are generated
from the NGFF JSON specification and manually refined, providing 
composable validators for working with NGFF
metadata in JavaScript and TypeScript.

# install

```sh
pnpm install zod ome-ngff-schema-zod
```

# usage

```typescript
import { z } from "zod";
import * as v04 from "ome-ngff-schema-zod/v04";

let Attrs = z.union([
  v04.StrictImageSchema,
  v04.StrictLabelSchema,
  v04.StrictPlateSchema,
  v04.StrictWellSchema,
]);

let url =
  "https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.4/idr0048A/9846152.zarr/";

// The following throws a `z.ZodError` if the `.zattrs`
// JSON does not conform to the union schema above.
let attrs = Attrs.parse(
  await fetch(`${url}.zattrs`).then((res) => res.json()),
);

// TypeScript now _knows_ the type of attrs (since it passed validation)

attrs;
//^? StrictImageSchema | StrictLabelSchema | StrictPlateSchema | StrictWellSchema

if ("multiscales" in attrs) {
  console.log("Multiscales:", attrs.multiscales);
                            //^? StrictImageSchema
}

if ("image-label" in attrs) {
  console.log("Label:", attrs["image-label"]);
                      //^? StrictLabelSchema
}

if ("well" in attrs) {
  console.log("Well:", attrs.well);
                     //^? StrictWellSchema
}

if ("plate" in attrs) {
  console.log("Plate:", attrs.plate);
                      //^? StrictPlateSchema
}
```

# sub-packages

Validators are exported for `v0.1`, `v0.2`, `v0.3`, and `v0.4` schemas.

```typescript
import * as v01 from "ome-ngff-schema-zod/0.1";
import * as v02 from "ome-ngff-schema-zod/0.2";
import * as v03 from "ome-ngff-schema-zod/0.3";
import * as v04 from "ome-ngff-schema-zod/0.4";

import * as schemas from "ome-ngff-schema-zod"; // latest
```

# development

The contents of `src/` are automatically generated from the
[NGFF JSON specification](https://github.com/ome/ngff) via:

```sh
node scripts/generate-schemas.mjs latest # or 0.1, 0.2, 0.3, 0.4, latest
```

# changelogs

For changes to be reflected in package changelogs, run `pnpm changeset` and
follow the prompts.

> **Note** not every PR requires a changeset. Since changesets are focused on
> releases and changelogs, changes to the repository that don't effect these
> won't need a changeset (e.g., documentation, tests).

# release

The [Changesets GitHub action](https://github.com/changesets/action) will create
and update a PR that applies changesets and publishes new versions.
