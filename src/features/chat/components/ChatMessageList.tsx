import { useEffect, useRef } from "react";

import { ChatRole } from "@/lib/constants";

import type { ChatMessage } from "../types";

interface ChatMessageListProps {
  messages: ChatMessage[];
  isWaiting: boolean;
}

const ROLE_LABEL: Record<ChatRole, string> = {
  [ChatRole.STUDENT]: "You",
  [ChatRole.ASSISTANT]: "Tutor",
};

const BUBBLE_STYLE: Record<ChatRole, string> = {
  [ChatRole.STUDENT]: "self-end bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900",
  [ChatRole.ASSISTANT]: "self-start bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100",
};

/** The scrolling conversation between the student and the tutor. */
export function ChatMessageList({ messages, isWaiting }: ChatMessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, isWaiting]);

  return (
    <div
      role="log"
      aria-live="polite"
      aria-label="Conversation with the AI tutor"
      className="flex min-h-48 flex-1 flex-col gap-3 overflow-y-auto"
    >
      {messages.length === 0 && !isWaiting && (
        <p className="m-auto text-center text-sm text-zinc-600 dark:text-zinc-400">
          Ask a question about your work. The tutor will guide you without giving away the answer.
        </p>
      )}
      {messages.map((message) => (
        <div
          key={message.id}
          className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${BUBBLE_STYLE[message.role]}`}
        >
          <p className="sr-only">{ROLE_LABEL[message.role]} said:</p>
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
      ))}
      {isWaiting && (
        <p className="self-start text-sm text-zinc-600 dark:text-zinc-400">Tutor is thinking…</p>
      )}
      <div ref={endRef} />
    </div>
  );
}
