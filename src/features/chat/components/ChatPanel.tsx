"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Panel } from "@/components/ui/Panel";
import { ApiError } from "@/lib/api";
import { ChatRole, ROUTES } from "@/lib/constants";

import { sendChatMessage } from "../api";
import type { ChatMessage } from "../types";
import { ChatComposer } from "./ChatComposer";
import { ChatLocked } from "./ChatLocked";
import { ChatMessageList } from "./ChatMessageList";

interface ChatPanelProps {
  /** The student's submission. Null until they start the assignment. */
  submissionId: string | null;
  /** The tutor unlocks once step 1 (the attempt) is saved. */
  attemptSaved: boolean;
}

const ATTEMPT_FIRST_REASON = "Save your attempt first. The tutor unlocks after step 1.";
const UNEXPECTED_ERROR_MESSAGE = "Something went wrong. Please try again.";

/** The AI tutor panel in the student workspace. */
export function ChatPanel({ submissionId, attemptSaved }: ChatPanelProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // The backend has the final say: it can lock chat even after the attempt
  // is saved, for example during the AI interview.
  const [serverLockReason, setServerLockReason] = useState<string | null>(null);

  const lockReason = !submissionId || !attemptSaved ? ATTEMPT_FIRST_REASON : serverLockReason;

  async function send() {
    if (!submissionId) {
      return;
    }
    const content = draft.trim();
    const pending: ChatMessage = {
      id: `pending-${crypto.randomUUID()}`,
      role: ChatRole.STUDENT,
      content,
      created_at: new Date().toISOString(),
    };

    setMessages((current) => [...current, pending]);
    setDraft("");
    setError(null);
    setIsSending(true);
    try {
      const reply = await sendChatMessage(submissionId, content);
      setMessages((current) => [...current, reply]);
    } catch (caught) {
      // Take the unsent message back out and restore it so the student can retry.
      setMessages((current) => current.filter((message) => message.id !== pending.id));
      setDraft(content);
      handleSendError(caught);
    } finally {
      setIsSending(false);
    }
  }

  function handleSendError(caught: unknown) {
    if (!(caught instanceof ApiError)) {
      setError(UNEXPECTED_ERROR_MESSAGE);
      return;
    }
    if (caught.status === 401) {
      router.push(ROUTES.LOGIN);
      return;
    }
    if (caught.status === 403) {
      setServerLockReason(caught.message);
      return;
    }
    setError(caught.message);
  }

  return (
    <Panel title="AI tutor" headingId="workspace-ai" bodyClassName="flex flex-col gap-3 p-4">
      {lockReason ? (
        <ChatLocked reason={lockReason} />
      ) : (
        <>
          <ChatMessageList messages={messages} isWaiting={isSending} />
          {error && (
            <p role="alert" className="text-sm text-red-700 dark:text-red-300">
              {error}
            </p>
          )}
          <ChatComposer draft={draft} onDraftChange={setDraft} onSend={send} isSending={isSending} />
        </>
      )}
    </Panel>
  );
}
