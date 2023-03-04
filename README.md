# ome-ngff-schema-zod

[![Node version](https://img.shields.io/npm/v/ome-ngff-schema-zod.svg)](https://www.npmjs.com/package/ome-ngff-schema-zod)
![GitHub Actions](https://github.com/manzt/ome-ngff-schema-zod/actions/workflows/ci.yml/badge.svg)


zod schemas for [ome-ngff](https://github.com/ome/ngff).

> **Warning**: here be dragons...

# install

```sh
pnpm install zod ome-ngff-schema-zod
```

# usage

```typescript
import { z } from "zod";
import * as schemas from "ome-ngff-schema-zod";

let Attrs = z.union([
  schemas.StrictImageSchema,
  schemas.StrictLabelSchema,
  schemas.StrictPlateSchema,
  schemas.StrictWellSchema,
]);

let url =
  "https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.4/idr0048A/9846152.zarr/";

let attrs = Attrs.parse(
  await fetch(`${url}.zattrs`).then((res) => res.json()),
);

if ("multiscales" in attrs) {
  console.log("Multiscales:", attrs.multiscales);
}

if ("image-label" in attrs) {
  console.log("Label:", attrs["image-label"]);
}

if ("well" in attrs) {
  console.log("Well:", attrs.well);
}

if ("plate" in attrs) {
  console.log("Plate:", attrs.plate);
}
```

# development

The contents of `src/` are automatically generated from the
[NGFF JSON specification](https://github.com/ome/ngff) via:

```sh
pnpm generate-schemas
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
