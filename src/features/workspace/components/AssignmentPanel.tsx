import { Panel } from "@/components/ui/Panel";

import type { WorkspaceQuestion } from "../types";
import { QuestionList } from "./QuestionList";

interface AssignmentPanelProps {
  instructions: readonly string[];
  questions: readonly WorkspaceQuestion[];
  selectedQuestionId: string;
  onSelectQuestion: (questionId: string) => void;
}

/** Left pane: the assignment overview and its list of questions. */
export function AssignmentPanel({
  instructions,
  questions,
  selectedQuestionId,
  onSelectQuestion,
}: AssignmentPanelProps) {
  return (
    <Panel title="Assignment" headingId="workspace-assignment" bodyClassName="flex flex-col">
      <div className="flex flex-col gap-3 p-4">
        {instructions.map((paragraph, index) => (
          // Paragraphs are static text that never reorders, so the index is a stable key.
          <p key={index} className="text-sm leading-6 text-muted">
            {paragraph}
          </p>
        ))}
      </div>
      <QuestionList questions={questions} selectedQuestionId={selectedQuestionId} onSelect={onSelectQuestion} />
    </Panel>
  );
}
