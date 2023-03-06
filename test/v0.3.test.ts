import { describe, expect, it, test } from "vitest";
import * as utils from "./utils";

import * as v03 from "../src/0.3";

let glob = utils.globber("0.3");

describe("v0.3", async () => {
  test.each(await glob("image/valid/*.json"))(
    "image: valid $name",
    async (file) => {
      let result = v03.ImageSchema.safeParse(await file.json());
      expect(result.success).toBe(true);
    },
  );

  test.each(await glob("image/invalid/*.json"))(
    "plate: invalid $name",
    async (file) => {
      let result = v03.ImageSchema.safeParse(await file.json());
      expect(result.success).toBe(false);
    },
  );

  test.each(await glob("plate/valid/*.json"))(
    "plate: valid $name",
    async (file) => {
      let result = v03.PlateSchema.safeParse(await file.json());
      expect(result.success).toBe(true);
    },
  );

  test.each(await glob("plate/invalid/*.json"))(
    "plate: valid $name",
    async (file) => {
      let result = v03.PlateSchema.safeParse(await file.json());
      expect(result.success).toBe(false);
    },
  );

  test.each(await glob("well/valid/*.json"))(
    "well: valid $name",
    async (file) => {
      let result = v03.WellSchema.safeParse(await file.json());
      expect(result.success).toBe(true);
    },
  );

  test.each(await glob("well/invalid/*.json"))(
    "well: valid $name",
    async (file) => {
      let result = v03.WellSchema.safeParse(await file.json());
      expect(result.success).toBe(false);
    },
  );
});

describe("v0.3 (strict)", async () => {
  let all = await glob("image/valid/*.json");

  let complete = all.filter((file) => file.path.includes("image_"));
  let incomplete = all.filter((file) => !file.path.includes("image_"));

  test.each(complete)("image: valid $name (strict)", async (file) => {
    let result = v03.StrictImageSchema.safeParse(await file.json());
    expect(result.success).toBe(true);
  });

  test.each(incomplete)("image: invalid $name (strict)", async (file) => {
    let result = v03.StrictImageSchema.safeParse(await file.json());
    expect(result.success).toBe(false);
  });
});
