import { describe, expect, it } from "vitest";

import { AnswerType, DEFAULT_CODE_LANGUAGE } from "@/lib/constants";

import { draftProblem, isPromptMissing, newQuestion, withAnswerType } from "./questions";
import type { SetupQuestion } from "./types";

const TEXT_QUESTION: SetupQuestion = {
  id: "q1",
  position: 1,
  prompt: "Explain your loop.",
  answer_type: AnswerType.TEXT,
  language: null,
  starter_code: null,
};

describe("withAnswerType", () => {
  it("gives a question switched to code the default language", () => {
    const code = withAnswerType(TEXT_QUESTION, AnswerType.CODE);
    expect(code.answer_type).toBe(AnswerType.CODE);
    expect(code.language).toBe(DEFAULT_CODE_LANGUAGE);
  });

  it("keeps the language a code question already has", () => {
    const java = { ...TEXT_QUESTION, answer_type: AnswerType.CODE, language: "java" };
    expect(withAnswerType(java, AnswerType.CODE).language).toBe("java");
  });

  it("clears the language when a code question becomes math", () => {
    const code = withAnswerType(TEXT_QUESTION, AnswerType.CODE);
    const math = withAnswerType(code, AnswerType.MATH);
    expect(math.answer_type).toBe(AnswerType.MATH);
    expect(math.language).toBeNull();
  });
});

describe("isPromptMissing", () => {
  it("treats blank text as missing", () => {
    expect(isPromptMissing({ ...TEXT_QUESTION, prompt: "   " })).toBe(true);
    expect(isPromptMissing(TEXT_QUESTION)).toBe(false);
  });
});

describe("draftProblem", () => {
  const question = { ...newQuestion(1), prompt: "Explain a loop." };

  it("accepts a titled draft whose questions all have text", () => {
    expect(draftProblem({ title: "Week 4", questions: [question] })).toBeNull();
  });

  it("names the first thing to fix", () => {
    expect(draftProblem({ title: "  ", questions: [question] })).toBe("Give the assignment a title.");
    expect(draftProblem({ title: "Week 4", questions: [] })).toBe("Add at least one question.");
    expect(draftProblem({ title: "Week 4", questions: [question, newQuestion(2)] })).toBe(
      "Fill in the text of every question.",
    );
  });
});

describe("newQuestion", () => {
  it("makes an empty written question with its own id", () => {
    const first = newQuestion(3);

    expect(first).toMatchObject({ position: 3, prompt: "", answer_type: "text", language: null, starter_code: null });
    expect(first.id).not.toBe(newQuestion(3).id);
  });
});
