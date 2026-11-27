"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { ROUTES } from "@/lib/constants";

const PAUSE_FAILED = "Couldn't save, so you're still here. Check your connection and try again.";

interface PauseButtonProps {
  /** Saves the student's work. Resolves to false if it couldn't. */
  onSave: () => Promise<boolean>;
}

/** Saves the work, then goes back to the assignment list. Reopening the assignment resumes it. */
export function PauseButton({ onSave }: PauseButtonProps) {
  const router = useRouter();
  const [isPausing, setIsPausing] = useState(false);
  const [failed, setFailed] = useState(false);

  // Next keeps the page alive while the student is away and shows it again on return.
  // Reset when it's put away, so the button is ready again instead of "Saving…".
  useEffect(() => () => setIsPausing(false), []);

  async function pause() {
    setIsPausing(true);
    setFailed(false);
    if (await onSave()) {
      router.push(ROUTES.STUDENT);
      return;
    }
    setFailed(true);
    setIsPausing(false);
  }

  return (
    <div className="flex items-center gap-2">
      {failed && (
        <ErrorMessage role="alert" className="text-footnote">
          {PAUSE_FAILED}
        </ErrorMessage>
      )}
      <Button variant="tinted" size="small" onClick={pause} disabled={isPausing}>
        {isPausing ? "Saving…" : "Save and pause"}
      </Button>
    </div>
  );
}
