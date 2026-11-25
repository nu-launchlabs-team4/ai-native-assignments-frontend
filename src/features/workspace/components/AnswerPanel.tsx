
import { Panel } from "@/components/ui/Panel";
import { ANSWER_TYPE_LABELS, AnswerType } from "@/lib/constants";

import type { WorkspaceQuestion } from "../types";
import { AnswerEditor } from "./AnswerEditor";

interface AnswerPanelProps {
  question: WorkspaceQuestion;
  questionNumber: number;
  answer: string;
  onAnswerChange: (value: string) => void;
  onPaste: () => void;
}

function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed === "" ? 0 : trimmed.split(/\s+/).length;
}

function headerMeta(question: WorkspaceQuestion, answer: string): string {
  switch (question.answerType) {
    case AnswerType.CODE:
      return question.fileName;
    case AnswerType.TEXT: {
      const words = countWords(answer);
      return `${words} ${words === 1 ? "word" : "words"}`;
    }
    case AnswerType.MATH:
      return ANSWER_TYPE_LABELS[AnswerType.MATH];
  }
}

/** Middle pane: the selected question and the editor for its answer. */
export function AnswerPanel({
  question,
  questionNumber,
  answer,
  onAnswerChange,
  onPaste,
}: AnswerPanelProps) {
  return (
    <Panel
      title={`Question ${questionNumber}`}
      headingId="workspace-answer"
      meta={
        <span
          className={
            question.answerType === AnswerType.CODE ? "font-mono" : undefined
          }
        >
          {headerMeta(question, answer)}
        </span>
      }
      bodyClassName="flex flex-col"
      className="min-h-96 lg:min-h-0"
    >
      <div className="flex flex-col gap-2 border-b border-line p-4">
        {question.prompt.map((paragraph, index) => (
          <p key={index} className="text-sm leading-6">
            {paragraph}
          </p>
        ))}
      </div>

      <div className="min-h-0 flex-1" onPasteCapture={onPaste}>
        <AnswerEditor
          question={question}
          value={answer}
          ariaLabel={`Your answer to question ${questionNumber}`}
          onChange={onAnswerChange}
        />
      </div>
    </Panel>
  );
}
