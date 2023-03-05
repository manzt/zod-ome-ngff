import { describe, expect, test } from "vitest";
import * as utils from "./utils";
import * as v02 from "../src/0.2";

let glob = utils.globber("0.2");

describe("v0.2", async () => {
  test.each(await glob("image/valid/*.json"))(
    "image: valid $name",
    async (file) => {
      let result = v02.ImageSchema.safeParse(await file.json());
      expect(result.success).toBe(true);
    },
  );

  test.each(await glob("image/invalid/*.json"))(
    "plate: invalid $name",
    async (file) => {
      let result = v02.ImageSchema.safeParse(await file.json());
      expect(result.success).toBe(false);
    },
  );

  test.each(await glob("plate/valid/*.json"))(
    "plate: valid $name",
    async (file) => {
      let result = v02.PlateSchema.safeParse(await file.json());
      expect(result.success).toBe(true);
    },
  );

  test.each(await glob("plate/invalid/*.json"))(
    "plate: valid $name",
    async (file) => {
      let result = v02.PlateSchema.safeParse(await file.json());
      expect(result.success).toBe(false);
    },
  );

  test.each(await glob("well/valid/*.json"))(
    "well: valid $name",
    async (file) => {
      let result = v02.WellSchema.safeParse(await file.json());
      expect(result.success).toBe(true);
    },
  );

  test.each(await glob("well/invalid/*.json"))(
    "well: valid $name",
    async (file) => {
      let result = v02.WellSchema.safeParse(await file.json());
      expect(result.success).toBe(false);
    },
  );
});
