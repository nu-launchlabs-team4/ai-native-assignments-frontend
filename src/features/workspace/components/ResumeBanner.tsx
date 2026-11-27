import { Button } from "@/components/ui/Button";
import type { SubmissionOut } from "@/lib/api-types";
import { STEP_LABELS, STEP_ORDER, Step, SubmissionStatus } from "@/lib/constants";

/** The student is coming back to work they started: an answer written, or past step 1. */
export function isResuming(submission: SubmissionOut, answeredCount: number): boolean {
  if (submission.status === SubmissionStatus.SUBMITTED) return false;
  return submission.current_step !== Step.ATTEMPT || answeredCount > 0;
}

interface ResumeBannerProps {
  submission: SubmissionOut;
  onDismiss: () => void;
}

/** "Welcome back": the work is saved, and this is where the student left off. */
export function ResumeBanner({ submission, onDismiss }: ResumeBannerProps) {
  const stepNumber = STEP_ORDER.indexOf(submission.current_step) + 1;

  return (
    <aside
      aria-labelledby="resume-banner"
      className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-b border-line bg-surface px-4 py-2 text-sm"
    >
      <p className="min-w-0 flex-1">
        <span id="resume-banner" className="font-semibold">
          Welcome back.{" "}
        </span>
        <span className="text-muted">
          Your work is saved. You&apos;re on step {stepNumber} of {STEP_ORDER.length}:{" "}
          {STEP_LABELS[submission.current_step]}.
        </span>
      </p>
      <Button variant="plain" size="small" onClick={onDismiss}>
        Continue
      </Button>
    </aside>
  );
}
