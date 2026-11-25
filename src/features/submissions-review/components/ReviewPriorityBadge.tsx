import { REVIEW_PRIORITY_LABELS, ReviewPriority } from "@/lib/constants";

// The label carries the meaning; the weight only helps scanning, so it never relies on colour. Each pairing meets 4.5:1.
const EMPHASIS: Record<ReviewPriority, string> = {
  [ReviewPriority.ROUTINE]: "bg-fill text-foreground",
  [ReviewPriority.WORTH_REVIEWING]: "bg-accent-soft text-accent font-medium",
  [ReviewPriority.NEEDS_CONVERSATION]: "bg-accent text-accent-foreground font-semibold",
};

/** Shows a submission's review priority. A pointer for the professor, never a verdict. */
export function ReviewPriorityBadge({ priority }: { priority: ReviewPriority }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-caption ${EMPHASIS[priority]}`}>
      {REVIEW_PRIORITY_LABELS[priority]}
    </span>
  );
}
