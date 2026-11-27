"use client";

import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

import type { SaveStatus } from "../use-answers";
import { SaveStatusLine } from "./SaveStatusLine";

interface FinishRevisionPanelProps {
  answeredCount: number;
  questionCount: number;
  saveStatus: SaveStatus;
  lastSavedAt: Date | null;
  isSubmitting: boolean;
  submitError: string | null;
  onFinish: () => void;
}

/** Step 4, under the question list: progress, the save status and Submit revision. */
export function FinishRevisionPanel({
  answeredCount,
  questionCount,
  saveStatus,
  lastSavedAt,
  isSubmitting,
  submitError,
  onFinish,
}: FinishRevisionPanelProps) {
  const allAnswered = answeredCount === questionCount;

  return (
    <section aria-labelledby="finish-revision" className="flex flex-col gap-4 border-t border-line p-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline justify-between gap-2">
          <h3 id="finish-revision" className="text-sm font-semibold">
            Revise your answers
          </h3>
          <p className={`text-xs ${allAnswered ? "text-success" : "text-muted"}`}>
            {answeredCount} of {questionCount} answered
          </p>
        </div>
        <p className="text-xs text-muted">
          Use what you learned from the feedback. Your attempt is kept as it was, under Original attempt.
        </p>
      </div>

      {submitError && (
        <ErrorMessage role="alert" className="text-sm">
          {submitError}
        </ErrorMessage>
      )}

      <Button disabled={!allAnswered || isSubmitting} onClick={onFinish} className="w-full">
        {isSubmitting ? "Submitting…" : "Submit revision"}
      </Button>
      {!allAnswered && <p className="-mt-2 text-xs text-muted">Answer every question to submit.</p>}

      <SaveStatusLine status={saveStatus} lastSavedAt={lastSavedAt} />
    </section>
  );
}
