import { Panel } from "@/components/ui/Panel";

// TODO(singhsaravjit): replace the placeholder with the chat panel (#10).
/** The AI tutor column. A locked placeholder until the chat panel is built. */
export function AIPanel() {
  return (
    <Panel
      title="AI tutor"
      headingId="workspace-ai"
      bodyClassName="flex flex-col items-center justify-center gap-2 p-6 text-center"
    >
      <p className="text-sm font-medium">The AI tutor is locked</p>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        It unlocks after you save your attempt.
      </p>
    </Panel>
  );
}
