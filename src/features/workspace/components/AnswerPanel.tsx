import type { ClipboardEvent, ReactNode } from "react";

import { Panel } from "@/components/ui/Panel";
import { ANSWER_TYPE_LABELS, AnswerType } from "@/lib/constants";

import type { WorkspaceQuestion } from "../types";
import { AnswerEditor } from "./AnswerEditor";

interface AnswerPanelProps {
  question: WorkspaceQuestion;
  questionNumber: number;
  answer: string;
  onAnswerChange: (value: string) => void;
  readOnly?: boolean;
  /** A control between the question and the editor, such as the revision's version switch. */
  toolbar?: ReactNode;
  /** Called with the size of each paste into the editor. The text itself is never read on. */
  onPaste?: (characters: number) => void;
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
  readOnly = false,
  toolbar,
  onPaste,
}: AnswerPanelProps) {
  function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    if (!readOnly) onPaste?.(event.clipboardData.getData("text/plain").length);
  }

  return (
    <Panel
      title={`Question ${questionNumber}`}
      headingId="workspace-answer"
      meta={<span className={question.answerType === AnswerType.CODE ? "font-mono" : undefined}>{headerMeta(question, answer)}</span>}
      bodyClassName="flex flex-col"
      className="min-h-96 lg:min-h-0"
    >
      <div className="flex flex-col gap-2 border-b border-line p-4">
        {question.prompt.map((paragraph, index) => (
          // Paragraphs are static text that never reorders, so the index is a stable key.
          <p key={index} className="text-sm leading-6">
            {paragraph}
          </p>
        ))}
      </div>
      {toolbar && <div className="border-b border-line px-4 py-2">{toolbar}</div>}
      {/* Capture, so pastes into Monaco's and MathLive's own inputs are seen too. */}
      <div className="min-h-0 flex-1" onPasteCapture={handlePaste}>
        <AnswerEditor
          question={question}
          value={answer}
          ariaLabel={`Your answer to question ${questionNumber}`}
          onChange={onAnswerChange}
          readOnly={readOnly}
        />
      </div>
    </Panel>
  );
}
