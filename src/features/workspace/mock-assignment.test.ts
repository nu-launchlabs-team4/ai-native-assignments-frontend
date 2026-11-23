import { describe, expect, it } from "vitest";

import { AnswerType } from "@/lib/constants";

import { getMockAssignment, MOCK_ASSIGNMENT_ID } from "./mock-assignment";

describe("getMockAssignment", () => {
  it("returns the demo assignment by id", () => {
    expect(getMockAssignment(MOCK_ASSIGNMENT_ID)?.id).toBe(MOCK_ASSIGNMENT_ID);
  });

  it("has one question of each answer type, in order", () => {
    const questions = getMockAssignment(MOCK_ASSIGNMENT_ID)?.questions ?? [];
    expect(questions.map((question) => question.answer_type)).toEqual([
      AnswerType.CODE,
      AnswerType.TEXT,
      AnswerType.MATH,
    ]);
    expect(questions.map((question) => question.position)).toEqual([1, 2, 3]);
  });

  it("returns null for an unknown id", () => {
    expect(getMockAssignment("does-not-exist")).toBeNull();
  });
});
