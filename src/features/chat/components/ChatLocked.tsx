interface ChatLockedProps {
  reason: string;
}

/** Shown instead of the conversation while the tutor is not available. */
export function ChatLocked({ reason }: ChatLockedProps) {
  return (
    <div
      role="status"
      className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-300 p-6 text-center dark:border-zinc-700"
    >
      <span aria-hidden="true" className="text-2xl">
        🔒
      </span>
      <p className="font-medium">AI tutor is locked</p>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{reason}</p>
    </div>
  );
}
