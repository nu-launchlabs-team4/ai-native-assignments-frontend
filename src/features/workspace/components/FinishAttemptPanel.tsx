"use client";

import { useId, useState } from "react";

import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { MAX_APPROACH_NOTE_CHARS } from "@/lib/constants";

import type { SaveStatus } from "../use-answers";
import { ConfidenceRating } from "./ConfidenceRating";
import { SaveStatusLine } from "./SaveStatusLine";

interface FinishAttemptPanelProps {
  answeredCount: number;
  questionCount: number;
  saveStatus: SaveStatus;
  lastSavedAt: Date | null;
  isFinishing: boolean;
  finishError: string | null;
  onFinish: (confidence: number, approachNote: string) => void;
}

/** Under the question list: progress, confidence, approach note and Submit attempt. */
export function FinishAttemptPanel({
  answeredCount,
  questionCount,
  saveStatus,
  lastSavedAt,
  isFinishing,
  finishError,
  onFinish,
}: FinishAttemptPanelProps) {
  const [confidence, setConfidence] = useState<number | null>(null);
  const [approachNote, setApproachNote] = useState("");
  const noteId = useId();

  const allAnswered = answeredCount === questionCount;
  const canSubmit = allAnswered && confidence !== null && approachNote.trim() !== "" && !isFinishing;

  return (
    <section aria-labelledby="finish-attempt" className="flex flex-col gap-4 border-t border-line p-4">
      <div className="flex items-baseline justify-between gap-2">
        <h3 id="finish-attempt" className="text-sm font-semibold">
          Finish your attempt
        </h3>
        <p className={`text-xs ${allAnswered ? "text-success" : "text-muted"}`}>
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
          className="resize-none rounded-md border border-field bg-surface px-3 py-2 text-sm placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        />
        <p className="text-right text-xs text-muted">
          {approachNote.length} / {MAX_APPROACH_NOTE_CHARS}
        </p>
      </div>

      {finishError && (
        <ErrorMessage role="alert" className="text-sm">
          {finishError}
        </ErrorMessage>
      )}

      <Button
        disabled={!canSubmit}
        onClick={() => confidence !== null && onFinish(confidence, approachNote)}
        className="w-full"
      >
        {isFinishing ? "Submitting…" : "Submit attempt"}
      </Button>
      {!allAnswered && (
        <p className="-mt-2 text-xs text-muted">Answer every question to submit.</p>
      )}

      <SaveStatusLine status={saveStatus} lastSavedAt={lastSavedAt} />
    </section>
  );
}
