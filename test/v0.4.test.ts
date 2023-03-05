import { describe, expect, it, test } from "vitest";
import * as schemas from "../src/0.4";
import { gather_test_cases } from "./utils";

let cases = await gather_test_cases("0.4", schemas);

describe.each(cases)("$description - $schema.id", ({ Schema, tests }) => {
  test.each(tests)("$formerly", ({ formerly, data, valid }) => {
    // TODO: handle duplicates?
    let should_skip = formerly.includes("duplicate");
    let message = valid ? "should be valid" : "should be invalid";
    it.skipIf(should_skip)(message, () => {
      expect(Schema.safeParse(data).success).toBe(valid);
    });
  });
});
