import { describe, expect, it, test } from "vitest";
import * as utils from "./utils";
import * as v01 from "../src/0.1";

let glob = utils.globber("0.1");

describe("v0.1", async () => {
  test.each(await glob("image/valid/*.json"))(
    "image: valid $name",
    async (file) => {
      let result = v01.ImageSchema.safeParse(await file.json());
      expect(result.success).toBe(true);
      expect(result).toMatchSnapshot();
    },
  );

  test.each(await glob("image/invalid/*.json"))(
    "plate: invalid $name",
    async (file) => {
      let result = v01.ImageSchema.safeParse(await file.json());
      expect(result.success).toBe(false);
      expect(result).toMatchSnapshot();
    },
  );

  test.each(await glob("plate/valid/*.json"))(
    "plate: valid $name",
    async (file) => {
      let result = v01.PlateSchema.safeParse(await file.json());
      expect(result.success).toBe(true);
      expect(result).toMatchSnapshot();
    },
  );

  test.each(await glob("plate/invalid/*.json"))(
    "plate: valid $name",
    async (file) => {
      let result = v01.PlateSchema.safeParse(await file.json());
      expect(result.success).toBe(false);
      expect(result).toMatchSnapshot();
    },
  );

  test.each(await glob("well/valid/*.json"))(
    "well: valid $name",
    async (file) => {
      let result = v01.WellSchema.safeParse(await file.json());
      expect(result.success).toBe(true);
      expect(result).toMatchSnapshot();
    },
  );

  test.each(await glob("well/invalid/*.json"))(
    "well: valid $name",
    async (file) => {
      let result = v01.WellSchema.safeParse(await file.json());
      expect(result.success).toBe(false);
      expect(result).toMatchSnapshot();
    },
  );
});

describe("v0.1 (strict)", async () => {
  let all = await glob("image/valid/*.json");

  let complete = all.filter((file) => file.path.includes("complete"));
  let incomplete = all.filter((file) => !file.path.includes("complete"));

  test.each(complete)("image: valid $name (strict)", async (file) => {
    let result = v01.StrictImageSchema.safeParse(await file.json());
    expect(result.success).toBe(true);
    expect(result).toMatchSnapshot();
  });

  test.each(incomplete)("image: invalid $name (strict)", async (file) => {
    // TODO: actually an error in ngff?
    let should_skip = file.name.includes("missing_type");
    it.skipIf(should_skip)("should be invalid)", async () => {
      let result = v01.StrictImageSchema.safeParse(await file.json());
      expect(result.success).toBe(false);
      expect(result).toMatchSnapshot();
    });
  });
});
