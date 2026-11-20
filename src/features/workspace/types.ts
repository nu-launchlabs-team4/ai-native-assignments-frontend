import type { AnswerType, Step } from "@/lib/constants";

interface QuestionBase {
  id: string;
  /** The question text, as paragraphs. */
  prompt: readonly string[];
  /** Pre-filled answer, such as starter code. Usually empty. */
  starterAnswer: string;
}

export interface CodeQuestion extends QuestionBase {
  answerType: typeof AnswerType.CODE;
  /** Monaco language id, such as "python". */
  language: string;
  /** Shown on the editor tab, such as "solution.py". */
  fileName: string;
}

export interface TextQuestion extends QuestionBase {
  answerType: typeof AnswerType.TEXT;
}

/** Math answers are LaTeX, one line per step of working, separated by "\n". */
export interface MathQuestion extends QuestionBase {
  answerType: typeof AnswerType.MATH;
}

export type WorkspaceQuestion = CodeQuestion | TextQuestion | MathQuestion;

/** What the workspace needs to show one assignment. Replaced by the backend schema in BE#9. */
export interface WorkspaceAssignment {
  id: string;
  title: string;
  /** Overview paragraphs shown above the question list. */
  instructions: readonly string[];
  questions: readonly WorkspaceQuestion[];
  currentStep: Step;
}

/** The student's answers, keyed by question id. */
export type Answers = Readonly<Record<string, string>>;
