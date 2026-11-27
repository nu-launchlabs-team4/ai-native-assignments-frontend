import { AnswerType, DEFAULT_CODE_LANGUAGE } from "@/lib/constants";

import type { SetupQuestion } from "./types";

/**
 * Change a question's answer type. The backend requires a language on code questions
 * and rejects one on any other type, so the language is set or cleared to match.
 */
export function withAnswerType(question: SetupQuestion, answerType: AnswerType): SetupQuestion {
  if (answerType === AnswerType.CODE) {
    return { ...question, answer_type: answerType, language: question.language ?? DEFAULT_CODE_LANGUAGE };
  }
  return { ...question, answer_type: answerType, language: null };
}

/** True when the question text is empty, which the backend would reject. */
export function isPromptMissing(question: SetupQuestion): boolean {
  return question.prompt.trim() === "";
}

/**
 * An empty written question for the professor to fill in. The id is only for the page:
 * the backend gives every question a new id when the assignment is saved.
 */
export function newQuestion(position: number): SetupQuestion {
  return {
    id: `new-${crypto.randomUUID()}`,
    position,
    prompt: "",
    answer_type: AnswerType.TEXT,
    language: null,
    starter_code: null,
  };
}

/** Why the draft can't be saved yet, in words for the professor, or `null` if it can. */
export function draftProblem(assignment: { title: string; questions: readonly SetupQuestion[] }): string | null {
  if (assignment.title.trim() === "") {
    return "Give the assignment a title.";
  }
  if (assignment.questions.length === 0) {
    return "Add at least one question.";
  }
  if (assignment.questions.some(isPromptMissing)) {
    return "Fill in the text of every question.";
  }
  return null;
}
