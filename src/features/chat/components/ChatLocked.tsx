interface ChatLockedProps {
  reason: string;
}

function LockIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6 text-muted" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

/** Shown instead of the conversation while the tutor is not available. */
export function ChatLocked({ reason }: ChatLockedProps) {
  return (
    <div role="status" className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
      <LockIcon />
      <p className="text-sm font-medium">AI tutor is locked</p>
      <p className="text-sm text-muted">{reason}</p>
    </div>
  );
}
