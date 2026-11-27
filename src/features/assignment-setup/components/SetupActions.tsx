"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";

export type SetupAction = "save" | "publish";

interface SetupActionsProps {
  /** The call in progress, if any. */
  pending: SetupAction | null;
  published: boolean;
  /** False when there is nothing students could answer yet. */
  canPublish: boolean;
  /** The result of the last save or publish, shown to screen readers too. */
  notice: string | null;
  error: string | null;
  onSave: () => void;
  onPublish: () => void;
}

/**
 * Save draft and Publish. Publishing asks once more first, because a published
 * assignment can't be edited.
 */
export function SetupActions({ pending, published, canPublish, notice, error, onSave, onPublish }: SetupActionsProps) {
  const [confirming, setConfirming] = useState(false);
  const busy = pending !== null;

  return (
    <div className="flex flex-col gap-2">
      {!published && (
        <div className="flex flex-wrap items-center gap-3">
          {confirming ? (
            <>
              <p className="text-callout font-medium">Publish now? Students will see it, and you can&apos;t edit it after.</p>
              <Button
                onClick={() => {
                  setConfirming(false);
                  onPublish();
                }}
              >
                Yes, publish
              </Button>
              <Button variant="plain" onClick={() => setConfirming(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button variant="tinted" disabled={busy} onClick={onSave}>
                {pending === "save" ? "Saving…" : "Save draft"}
              </Button>
              <Button disabled={busy || !canPublish} onClick={() => setConfirming(true)}>
                {pending === "publish" ? "Publishing…" : "Publish"}
              </Button>
              {!canPublish && <p className="text-callout text-muted">Add at least one question to publish.</p>}
            </>
          )}
        </div>
      )}
      <p role="status" className="text-callout text-muted">
        {notice ?? ""}
      </p>
      {error && (
        <p role="alert" className="text-callout font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
