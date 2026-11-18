import { Panel } from "@/components/ui/Panel";
import { ChatPanel } from "@/features/chat/components/ChatPanel";

import type { WorkspaceAssignment } from "../types";
import { CodeEditor } from "./CodeEditor";
import { InstructionsPanel } from "./InstructionsPanel";
import { StepStepper } from "./StepStepper";
import { WorkspaceShell } from "./WorkspaceShell";

interface WorkspaceProps {
  assignment: WorkspaceAssignment;
}

/** The student's workspace for one assignment. */
export function Workspace({ assignment }: WorkspaceProps) {
  return (
    <WorkspaceShell
      header={
        <>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Assignment</p>
            <h1 className="text-lg font-semibold">{assignment.title}</h1>
          </div>
          <StepStepper currentStep={assignment.currentStep} />
        </>
      }
      instructions={<InstructionsPanel instructions={assignment.instructions} />}
      editor={
        <Panel title="Your code" headingId="workspace-editor" bodyClassName="" className="min-h-96 lg:min-h-0">
          <CodeEditor
            value={assignment.starterCode}
            language={assignment.language}
            ariaLabel={`Code editor for ${assignment.title}`}
          />
        </Panel>
      }
      aiPanel={
        // TODO(singhsaravjit): pass the real submission and attempt state once autosave lands (#6).
        <ChatPanel submissionId={null} attemptSaved={false} />
      }
    />
  );
}
