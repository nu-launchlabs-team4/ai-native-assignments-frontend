import { describe, expect, it } from "vitest";

import { AnswerType } from "@/lib/constants";

import { getMockAssignment, MOCK_ASSIGNMENT_ID } from "./mock-assignment";

describe("getMockAssignment", () => {
  it("returns the sample assignment by id", () => {
    expect(getMockAssignment(MOCK_ASSIGNMENT_ID)?.id).toBe(MOCK_ASSIGNMENT_ID);
  });

  it("has one question of each answer type", () => {
    const types = getMockAssignment(MOCK_ASSIGNMENT_ID)?.questions.map((question) => question.answerType);
    expect(types).toEqual([AnswerType.CODE, AnswerType.TEXT, AnswerType.MATH]);
  });

  it("returns null for an unknown id", () => {
    expect(getMockAssignment("does-not-exist")).toBeNull();
  });
});
