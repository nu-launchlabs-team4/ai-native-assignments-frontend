import { AnswerType } from "@/lib/constants";

import type { WorkspaceQuestion } from "../types";
import { CodeEditor } from "./CodeEditor";
import { MathAnswer } from "./MathAnswer";
import { TextAnswer } from "./TextAnswer";

interface AnswerEditorProps {
  question: WorkspaceQuestion;
  value: string;
  ariaLabel: string;
  onChange: (value: string) => void;
  /** After the attempt is submitted, answers can be read but not changed. */
  readOnly?: boolean;
}

/** Shows the right editor for the question's answer type. */
export function AnswerEditor({ question, value, ariaLabel, onChange, readOnly = false }: AnswerEditorProps) {
  switch (question.answerType) {
    case AnswerType.CODE:
      return (
        <CodeEditor
          value={value}
          language={question.language}
          ariaLabel={ariaLabel}
          onChange={onChange}
          readOnly={readOnly}
        />
      );
    case AnswerType.TEXT:
      return <TextAnswer value={value} ariaLabel={ariaLabel} onChange={onChange} readOnly={readOnly} />;
    case AnswerType.MATH:
      return <MathAnswer value={value} ariaLabel={ariaLabel} onChange={onChange} readOnly={readOnly} />;
  }
}
