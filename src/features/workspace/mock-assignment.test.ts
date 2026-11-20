import { describe, expect, it } from "vitest";

import { getMockAssignment, MOCK_ASSIGNMENT_ID } from "./mock-assignment";

describe("getMockAssignment", () => {
  it("returns the sample assignment by id", () => {
    expect(getMockAssignment(MOCK_ASSIGNMENT_ID)?.id).toBe(MOCK_ASSIGNMENT_ID);
  });

  it("returns null for an unknown id", () => {
    expect(getMockAssignment("does-not-exist")).toBeNull();
  });
});
