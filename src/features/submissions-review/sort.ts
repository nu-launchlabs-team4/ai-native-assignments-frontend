import { ReviewPriority } from "@/lib/constants";

import type { SubmissionListItem } from "./types";

// Lower comes first. Submissions without a summary yet go last, since there is nothing to review.
const PRIORITY_RANK: Record<ReviewPriority, number> = {
  [ReviewPriority.NEEDS_CONVERSATION]: 0,
  [ReviewPriority.WORTH_REVIEWING]: 1,
  [ReviewPriority.ROUTINE]: 2,
};
const NO_SUMMARY_RANK = 3;

function rank(submission: SubmissionListItem): number {
  return submission.review_priority ? PRIORITY_RANK[submission.review_priority] : NO_SUMMARY_RANK;
}

/** Order submissions so the ones that most need the professor's attention come first. */
export function sortByReviewPriority(submissions: readonly SubmissionListItem[]): SubmissionListItem[] {
  return [...submissions].sort(
    (a, b) => rank(a) - rank(b) || a.student_name.localeCompare(b.student_name),
  );
}
