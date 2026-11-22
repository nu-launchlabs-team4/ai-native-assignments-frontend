import type { SetupQuestion } from "../types";
import { QuestionEditor } from "./QuestionEditor";

interface QuestionReviewListProps {
  questions: readonly SetupQuestion[];
  onQuestionChange: (question: SetupQuestion) => void;
}

/** The detected questions in their order, each one editable. */
export function QuestionReviewList({ questions, onQuestionChange }: QuestionReviewListProps) {
  if (questions.length === 0) {
    return <p className="text-sm text-muted">No questions were found in this PDF.</p>;
  }

  return (
    <ol aria-label="Detected questions" className="flex flex-col gap-4">
      {questions.map((question, index) => (
        <li key={question.id}>
          <QuestionEditor question={question} questionNumber={index + 1} onChange={onQuestionChange} />
        </li>
      ))}
    </ol>
  );
}
