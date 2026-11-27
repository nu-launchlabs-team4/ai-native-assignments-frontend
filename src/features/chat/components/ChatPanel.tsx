"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
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
  /** The conversation so far, shown when the panel opens (after a reload or a pause). */
  loadHistory: () => Promise<ChatMessage[]>;
}

type HistoryStatus = "loading" | "ready" | "error";

const ATTEMPT_FIRST_REASON = "Save your attempt first. The tutor unlocks after step 1.";
const UNEXPECTED_ERROR_MESSAGE = "Something went wrong. Please try again.";

/** The AI tutor panel in the student workspace. */
export function ChatPanel({ submissionId, attemptSaved, loadHistory }: ChatPanelProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // The backend has the final say: it can lock chat even after the attempt
  // is saved, for example during the AI interview.
  const [serverLockReason, setServerLockReason] = useState<string | null>(null);
  // A counter, not crypto.randomUUID(): that only exists on HTTPS or localhost,
  // so it would crash when testing over http://<laptop-IP>:3000.
  const pendingCount = useRef(0);

  const [historyStatus, setHistoryStatus] = useState<HistoryStatus>("loading");
  const [historyLoads, setHistoryLoads] = useState(0);

  const unlocked = Boolean(submissionId) && attemptSaved;
  const lockReason = !unlocked ? ATTEMPT_FIRST_REASON : serverLockReason;

  // Show the conversation so far. It replaces what's on screen, so showing the panel
  // again (Next keeps the page alive while the student is away) never doubles it.
  useEffect(() => {
    if (!unlocked) return;
    let cancelled = false;
    loadHistory()
      .then((history) => {
        if (cancelled) return;
        setMessages(history);
        setHistoryStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setHistoryStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [unlocked, loadHistory, historyLoads]);

  function retryHistory() {
    setHistoryStatus("loading");
    setHistoryLoads((count) => count + 1);
  }

  async function send() {
    if (!submissionId) {
      return;
    }
    const content = draft.trim();
    const pending: ChatMessage = {
      id: `pending-${++pendingCount.current}`,
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
          {historyStatus === "loading" && (
            <p role="status" className="text-sm text-muted">
              Loading your conversation…
            </p>
          )}
          {historyStatus === "error" && (
            <div className="flex items-center gap-3 text-sm">
              <ErrorMessage role="alert" className="text-sm">
                Couldn&apos;t load your conversation.
              </ErrorMessage>
              <Button variant="plain" size="small" onClick={retryHistory}>
                Try again
              </Button>
            </div>
          )}
          <ChatMessageList messages={messages} isWaiting={isSending} />
          {error && (
            <ErrorMessage role="alert" className="text-sm">
              {error}
            </ErrorMessage>
          )}
          <ChatComposer draft={draft} onDraftChange={setDraft} onSend={send} isSending={isSending} />
        </>
      )}
    </Panel>
  );
}
