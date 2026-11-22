import { REVIEW_PRIORITY_LABELS, ReviewPriority } from "@/lib/constants";

// The label carries the meaning; the weight only helps scanning, so it never relies on colour.
const EMPHASIS: Record<ReviewPriority, string> = {
  [ReviewPriority.ROUTINE]: "border-line text-muted",
  [ReviewPriority.WORTH_REVIEWING]: "border-foreground font-medium",
  [ReviewPriority.NEEDS_CONVERSATION]: "border-accent bg-accent text-accent-foreground font-semibold",
};

/** Shows a submission's review priority. A pointer for the professor, never a verdict. */
export function ReviewPriorityBadge({ priority }: { priority: ReviewPriority }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded border px-2 py-0.5 text-xs ${EMPHASIS[priority]}`}>
      {REVIEW_PRIORITY_LABELS[priority]}
    </span>
  );
}
