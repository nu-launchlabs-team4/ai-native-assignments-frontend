import { describe, expect, it } from "vitest";

import { safeNextPath } from "./next-path";

describe("safeNextPath", () => {
  it("keeps a page on this site", () => {
    expect(safeNextPath("/student/assignments/a1")).toBe("/student/assignments/a1");
  });

  it.each([null, "", "https://evil.example", "//evil.example", "/\\evil.example", "student", "/login", "/signup"])(
    "drops %s",
    (next) => {
      expect(safeNextPath(next)).toBeNull();
    },
  );
});
