import { describe, expect, test } from "vitest";

import * as schemas from "../src/latest";
import { gather_test_cases } from "./utils";

let cases = await gather_test_cases("latest", schemas);

describe.each(cases)("$description - $schema.id", ({ Schema, tests }) => {
  test.each(tests)("$formerly", ({ data, valid }) => {
    let result = Schema.safeParse(data);
    expect(result.success).toBe(valid);
    expect(result).toMatchSnapshot();
  });
});
