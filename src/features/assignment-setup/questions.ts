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
