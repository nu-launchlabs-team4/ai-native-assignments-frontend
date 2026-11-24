import { describe, expect, it } from "vitest";

import { AnswerType, Step } from "@/lib/constants";

import {
  attemptAnswers,
  fileNameFor,
  initialAnswers,
  isAnswered,
  toParagraphs,
  toWorkspaceAssignment,
} from "./map-submission";
import { buildSubmission } from "./testing";

describe("toWorkspaceAssignment", () => {
  it("splits prompts and instructions into paragraphs and keeps question order", () => {
    const assignment = toWorkspaceAssignment(buildSubmission());

    expect(assignment.instructions).toHaveLength(2);
    expect(assignment.questions.map((q) => q.answerType)).toEqual([
      AnswerType.CODE,
      AnswerType.TEXT,
      AnswerType.MATH,
    ]);
    expect(assignment.questions[0].prompt).toHaveLength(3);
    expect(assignment.currentStep).toBe(Step.ATTEMPT);
  });

  it("names the code file from the language", () => {
    const [codeQuestion] = toWorkspaceAssignment(buildSubmission()).questions;
    expect(codeQuestion.answerType === AnswerType.CODE && codeQuestion.fileName).toBe("solution.py");
    expect(fileNameFor("java")).toBe("solution.java");
    expect(fileNameFor("cobol")).toBe("solution.txt");
  });
});

describe("initialAnswers", () => {
  it("shows the revision from the revise step on, and keeps the attempt available", () => {
    const submission = buildSubmission({
      current_step: Step.REVISE,
      attempt_answers: { q2: "first try" },
      revision_answers: { q2: "second try" },
    });

    expect(initialAnswers(submission).q2).toBe("second try");
    expect(initialAnswers({ ...submission, current_step: Step.EXPLAIN }).q2).toBe("second try");
    expect(initialAnswers({ ...submission, current_step: Step.FEEDBACK }).q2).toBe("first try");
    expect(attemptAnswers(submission).q2).toBe("first try");
  });


  it("prefers saved answers over starter code", () => {
    const answers = initialAnswers(buildSubmission({ attempt_answers: { q1: "def mine(): pass" } }));

    expect(answers.q1).toBe("def mine(): pass");
    expect(answers.q2).toBe("");
  });

  it("falls back to starter code when nothing is saved", () => {
    expect(initialAnswers(buildSubmission()).q1).toContain("def count_vowels");
  });
});

describe("isAnswered", () => {
  it("needs more than whitespace", () => {
    expect(isAnswered("  \n ")).toBe(false);
    expect(isAnswered("5n+5")).toBe(true);
  });

  it("doesn't count untouched starter code", () => {
    expect(isAnswered("def f():\n  pass\n", "def f():\n  pass")).toBe(false);
    expect(isAnswered("def f():\n  return 1", "def f():\n  pass")).toBe(true);
  });
});

describe("toParagraphs", () => {
  it("drops empty paragraphs", () => {
    expect(toParagraphs("One.\n\n\n\nTwo.\n\n")).toEqual(["One.", "Two."]);
  });
});
