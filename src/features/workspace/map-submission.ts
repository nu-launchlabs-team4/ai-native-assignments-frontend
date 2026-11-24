import type { AnswerMap, QuestionOut, SubmissionOut } from "@/lib/api-types";
import { AnswerType, Step } from "@/lib/constants";

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
/** Whether a step shows the revision (steps 4 and 5) rather than the attempt. */
export function showsRevision(step: Step): boolean {
  return step === Step.REVISE || step === Step.EXPLAIN;
}

function answersFrom(submission: SubmissionOut, saved: AnswerMap): Answers {
  return Object.fromEntries(
    submission.assignment.questions.map((question) => [
      question.id,
      saved[question.id] ?? question.starter_code ?? "",
    ]),
  );
}

/**
 * The answers the workspace shows for the submission's step: the attempt in steps 1 to 3,
 * the revision in steps 4 and 5. Starter code fills any question without a saved answer.
 */
export function initialAnswers(submission: SubmissionOut): Answers {
  return answersFrom(
    submission,
    showsRevision(submission.current_step) ? submission.revision_answers : submission.attempt_answers,
  );
}

/** The step 1 answers, which stay as they were once the revision starts. */
export function attemptAnswers(submission: SubmissionOut): Answers {
  return answersFrom(submission, submission.attempt_answers);
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
