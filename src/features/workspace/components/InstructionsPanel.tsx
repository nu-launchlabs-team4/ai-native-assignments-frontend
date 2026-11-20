import { Panel } from "@/components/ui/Panel";

interface InstructionsPanelProps {
  instructions: readonly string[];
}

/** The assignment's task description. */
export function InstructionsPanel({ instructions }: InstructionsPanelProps) {
  return (
    <Panel title="Instructions" headingId="workspace-instructions" bodyClassName="flex flex-col gap-3 p-4">
      {instructions.map((paragraph, index) => (
        // Paragraphs are static text that never reorders, so the index is a stable key.
        <p key={index} className="text-sm leading-6 text-zinc-700 dark:text-zinc-300">
          {paragraph}
        </p>
      ))}
    </Panel>
  );
}
