import { Panel } from "@/components/ui/Panel";

function LockIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6 text-muted" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

// TODO(singhsaravjit): replace the placeholder with the chat panel (#10).
/** The AI tutor pane. A locked placeholder until the chat panel is built. */
export function AIPanel() {
  return (
    <Panel
      title="AI tutor"
      headingId="workspace-ai"
      bodyClassName="flex flex-col items-center justify-center gap-2 p-6 text-center"
    >
      <LockIcon />
      <p className="text-sm font-medium">The AI tutor is locked</p>
      <p className="text-sm text-muted">It unlocks after you save your attempt.</p>
    </Panel>
  );
}
