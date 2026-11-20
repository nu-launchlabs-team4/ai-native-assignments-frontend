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
}

/** Shows the right editor for the question's answer type. */
export function AnswerEditor({ question, value, ariaLabel, onChange }: AnswerEditorProps) {
  switch (question.answerType) {
    case AnswerType.CODE:
      return (
        <CodeEditor value={value} language={question.language} ariaLabel={ariaLabel} onChange={onChange} />
      );
    case AnswerType.TEXT:
      return <TextAnswer value={value} ariaLabel={ariaLabel} onChange={onChange} />;
    case AnswerType.MATH:
      return <MathAnswer value={value} ariaLabel={ariaLabel} onChange={onChange} />;
  }
}
