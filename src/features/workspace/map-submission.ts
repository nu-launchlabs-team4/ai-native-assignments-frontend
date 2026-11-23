import type { QuestionOut, SubmissionOut } from "@/lib/api-types";
import { AnswerType } from "@/lib/constants";

import type { Answers, WorkspaceAssignment, WorkspaceQuestion } from "./types";

// The backend doesn't store a file name, so the editor tab is named from the language.
const FILE_EXTENSIONS: Readonly<Record<string, string>> = {
  python: "py",
  java: "java",
  javascript: "js",
  typescript: "ts",
  c: "c",
  cpp: "cpp",
};

/** Split text into paragraphs on blank lines, dropping empty ones. */
export function toParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph !== "");
}

/** The editor tab name for a code question, such as "solution.py". */
export function fileNameFor(language: string): string {
  return `solution.${FILE_EXTENSIONS[language] ?? "txt"}`;
}

function toWorkspaceQuestion(question: QuestionOut): WorkspaceQuestion {
  const base = {
    id: question.id,
    prompt: toParagraphs(question.prompt),
    starterAnswer: question.starter_code ?? "",
  };
  if (question.answer_type === AnswerType.CODE) {
    const language = question.language ?? "plaintext";
    return { ...base, answerType: AnswerType.CODE, language, fileName: fileNameFor(language) };
  }
  return { ...base, answerType: question.answer_type };
}

/** Turn the backend's submission into what the workspace panes show. */
export function toWorkspaceAssignment(submission: SubmissionOut): WorkspaceAssignment {
  const { assignment } = submission;
  return {
    id: assignment.id,
    title: assignment.title,
    instructions: toParagraphs(assignment.instructions),
    questions: [...assignment.questions]
      .sort((a, b) => a.position - b.position)
      .map(toWorkspaceQuestion),
    currentStep: submission.current_step,
  };
}

/** Saved attempt answers, falling back to starter code for questions not answered yet. */
export function initialAnswers(submission: SubmissionOut): Answers {
  return Object.fromEntries(
    submission.assignment.questions.map((question) => [
      question.id,
      submission.attempt_answers[question.id] ?? question.starter_code ?? "",
    ]),
  );
}

/** The backend's rule for "answered": more than whitespace. */
export function hasText(answer: string | undefined): boolean {
  return (answer ?? "").trim() !== "";
}

/**
 * Whether the student has answered a question. Untouched starter code doesn't
 * count, so Submit only enables once every question holds the student's own work.
 */
export function isAnswered(answer: string | undefined, starterAnswer = ""): boolean {
  return hasText(answer) && (answer ?? "").trim() !== starterAnswer.trim();
}
