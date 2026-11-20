import { useId, type FormEvent, type KeyboardEvent } from "react";

import { CHAT_MAX_MESSAGE_LENGTH } from "@/lib/constants";

interface ChatComposerProps {
  draft: string;
  onDraftChange: (draft: string) => void;
  onSend: () => void;
  isSending: boolean;
}

/** Text box and send button for a new message to the tutor. */
export function ChatComposer({ draft, onDraftChange, onSend, isSending }: ChatComposerProps) {
  const inputId = useId();
  const canSend = draft.trim().length > 0 && !isSending;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (canSend) {
      onSend();
    }
  }

  // Enter sends, Shift+Enter adds a new line, like most chat apps.
  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <label htmlFor={inputId} className="sr-only">
        Message the AI tutor
      </label>
      <textarea
        id={inputId}
        value={draft}
        onChange={(event) => onDraftChange(event.target.value)}
        onKeyDown={handleKeyDown}
        maxLength={CHAT_MAX_MESSAGE_LENGTH}
        rows={3}
        placeholder="Ask the tutor…"
        className="resize-none rounded-md border border-line bg-surface px-3 py-2 text-sm placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2"
      />
      <button
        type="submit"
        disabled={!canSend}
        className="self-end rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50"
      >
        {isSending ? "Sending…" : "Send"}
      </button>
    </form>
  );
}
