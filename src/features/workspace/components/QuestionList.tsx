import { ANSWER_TYPE_LABELS } from "@/lib/constants";

import type { WorkspaceQuestion } from "../types";

interface QuestionListProps {
  questions: readonly WorkspaceQuestion[];
  selectedQuestionId: string;
  /** Questions the student has answered. They get a check mark. */
  answeredIds: ReadonlySet<string>;
  onSelect: (questionId: string) => void;
}

/** List of the assignment's questions. Selecting one opens it in the answer pane. */
export function QuestionList({ questions, selectedQuestionId, answeredIds, onSelect }: QuestionListProps) {
  return (
    <nav aria-label="Questions">
      <ol className="flex flex-col">
        {questions.map((question, index) => {
          const isSelected = question.id === selectedQuestionId;
          const isAnswered = answeredIds.has(question.id);
          return (
            <li key={question.id}>
              <button
                type="button"
                onClick={() => onSelect(question.id)}
                aria-current={isSelected ? "true" : undefined}
                className={`flex w-full items-center justify-between gap-2 border-l-2 px-4 py-2 text-left text-sm focus-visible:outline-2 focus-visible:-outline-offset-2 pointer-coarse:min-h-11 ${
                  isSelected
                    ? "border-accent bg-surface-muted font-medium"
                    : "border-transparent hover:bg-surface-muted"
                }`}
              >
                <span className="flex items-center gap-2">
                  Question {index + 1}
                  {isAnswered && (
                    <>
                      <span aria-hidden="true" className="text-green-700 dark:text-green-400">
                        ✓
                      </span>
                      <span className="sr-only">(answered)</span>
                    </>
                  )}
                </span>
                <span className="rounded border border-line px-1.5 py-0.5 text-xs text-muted">
                  {ANSWER_TYPE_LABELS[question.answerType]}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
