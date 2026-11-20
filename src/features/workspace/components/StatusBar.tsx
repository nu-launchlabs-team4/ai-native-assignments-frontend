import { ANSWER_TYPE_LABELS, AnswerType, STEP_LABELS, STEP_ORDER, type Step } from "@/lib/constants";

import type { WorkspaceQuestion } from "../types";

interface StatusBarProps {
  question: WorkspaceQuestion;
  questionNumber: number;
  questionCount: number;
  currentStep: Step;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** IDE-style status line: the open question, its answer type and the step progress. */
export function StatusBar({ question, questionNumber, questionCount, currentStep }: StatusBarProps) {
  const stepNumber = STEP_ORDER.indexOf(currentStep) + 1;
  const answerKind =
    question.answerType === AnswerType.CODE
      ? capitalize(question.language)
      : ANSWER_TYPE_LABELS[question.answerType];

  return (
    <p className="flex gap-3">
      <span>
        Question {questionNumber} of {questionCount}
      </span>
      <span aria-hidden="true">·</span>
      <span>{answerKind}</span>
      <span aria-hidden="true">·</span>
      <span>
        Step {stepNumber} of {STEP_ORDER.length}: {STEP_LABELS[currentStep]}
      </span>
    </p>
  );
}
