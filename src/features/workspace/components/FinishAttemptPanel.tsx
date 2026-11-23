"use client";

import { useId, useState } from "react";

import { MAX_APPROACH_NOTE_CHARS } from "@/lib/constants";

import type { SaveStatus } from "../use-attempt";
import { ConfidenceRating } from "./ConfidenceRating";

interface FinishAttemptPanelProps {
  answeredCount: number;
  questionCount: number;
  /** False once the attempt is submitted. */
  isAttemptStep: boolean;
  saveStatus: SaveStatus;
  lastSavedAt: Date | null;
  isFinishing: boolean;
  finishError: string | null;
  onFinish: (confidence: number, approachNote: string) => void;
}

function saveStatusText(status: SaveStatus, lastSavedAt: Date | null): string {
  switch (status) {
    case "saving":
      return "Saving…";
    case "unsaved":
      return "Unsaved changes. Saving automatically.";
    case "error":
      return "Couldn't save. Retrying…";
    case "saved":
      return lastSavedAt
        ? `Saved at ${lastSavedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
        : "All changes saved";
  }
}

/** Under the question list: progress, confidence, approach note and Submit attempt. */
export function FinishAttemptPanel({
  answeredCount,
  questionCount,
  isAttemptStep,
  saveStatus,
  lastSavedAt,
  isFinishing,
  finishError,
  onFinish,
}: FinishAttemptPanelProps) {
  const [confidence, setConfidence] = useState<number | null>(null);
  const [approachNote, setApproachNote] = useState("");
  const noteId = useId();

  if (!isAttemptStep) {
    return (
      <section aria-labelledby="finish-attempt" className="border-t border-line p-4">
        <h3 id="finish-attempt" className="text-sm font-semibold">
          Attempt submitted
        </h3>
        <p role="status" className="mt-1 text-sm text-muted">
          Your answers are saved and the AI tutor is unlocked.
        </p>
      </section>
    );
  }

  const allAnswered = answeredCount === questionCount;
  const canSubmit = allAnswered && confidence !== null && approachNote.trim() !== "" && !isFinishing;

  return (
    <section aria-labelledby="finish-attempt" className="flex flex-col gap-4 border-t border-line p-4">
      <div className="flex items-baseline justify-between gap-2">
        <h3 id="finish-attempt" className="text-sm font-semibold">
          Finish your attempt
        </h3>
        <p className={`text-xs ${allAnswered ? "text-green-700 dark:text-green-400" : "text-muted"}`}>
          {answeredCount} of {questionCount} answered
        </p>
      </div>

      <ConfidenceRating value={confidence} onChange={setConfidence} disabled={isFinishing} />

      <div className="flex flex-col gap-1">
        <label htmlFor={noteId} className="text-sm font-medium">
          How did you approach it?
        </label>
        <textarea
          id={noteId}
          value={approachNote}
          onChange={(event) => setApproachNote(event.target.value)}
          maxLength={MAX_APPROACH_NOTE_CHARS}
          rows={3}
          disabled={isFinishing}
          placeholder="A sentence or two about your plan."
          className="resize-none rounded border border-line bg-surface px-3 py-2 text-sm placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2"
        />
        <p className="text-right text-xs text-muted">
          {approachNote.length} / {MAX_APPROACH_NOTE_CHARS}
        </p>
      </div>

      {finishError && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-300">
          {finishError}
        </p>
      )}

      <button
        type="button"
        disabled={!canSubmit}
        onClick={() => confidence !== null && onFinish(confidence, approachNote)}
        className="rounded bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isFinishing ? "Submitting…" : "Submit attempt"}
      </button>
      {!allAnswered && (
        <p className="-mt-2 text-xs text-muted">Answer every question to submit.</p>
      )}

      <p role="status" aria-live="polite" className="text-xs text-muted">
        {saveStatusText(saveStatus, lastSavedAt)}
      </p>
    </section>
  );
}
