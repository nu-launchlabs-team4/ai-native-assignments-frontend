import { Button } from "@/components/ui/Button";
import { MAX_QUESTIONS } from "@/lib/constants";

import type { SetupQuestion } from "../types";
import { QuestionEditor } from "./QuestionEditor";

interface QuestionReviewListProps {
  questions: readonly SetupQuestion[];
  onQuestionChange: (question: SetupQuestion) => void;
  onAddQuestion: () => void;
  onRemoveQuestion: (questionId: string) => void;
  /** A published assignment can't change, so it has no add or remove buttons. */
  readOnly?: boolean;
}

/** The questions in their order, each one editable, with buttons to add and remove them. */
export function QuestionReviewList({
  questions,
  onQuestionChange,
  onAddQuestion,
  onRemoveQuestion,
  readOnly = false,
}: QuestionReviewListProps) {
  // An assignment needs at least one question, so the last one can't be removed.
  const canRemove = !readOnly && questions.length > 1;

  return (
    <div className="flex flex-col gap-4">
      {questions.length === 0 ? (
        <p className="text-callout text-muted">No questions yet.{!readOnly && " Add one below."}</p>
      ) : (
        <ol aria-label="Questions" className="flex flex-col gap-4">
          {questions.map((question, index) => (
            <li key={question.id}>
              <QuestionEditor
                question={question}
                questionNumber={index + 1}
                onChange={onQuestionChange}
                onRemove={canRemove ? () => onRemoveQuestion(question.id) : undefined}
              />
            </li>
          ))}
        </ol>
      )}
      {!readOnly && questions.length < MAX_QUESTIONS && (
        <Button variant="tinted" className="self-start" onClick={onAddQuestion}>
          Add question
        </Button>
      )}
    </div>
  );
}
