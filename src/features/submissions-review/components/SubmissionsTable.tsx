import Link from "next/link";

import { SUBMISSION_STATUS_LABELS, submissionSummaryRoute } from "@/lib/constants";

import { sortByReviewPriority } from "../sort";
import type { SubmissionListItem } from "../types";
import { LocalTime } from "./LocalTime";
import { ReviewPriorityBadge } from "./ReviewPriorityBadge";

interface SubmissionsTableProps {
  submissions: readonly SubmissionListItem[];
}

const CELL = "border-b border-line px-4 py-3 text-left";

/** Every submission for one assignment, with the ones that most need attention first. */
export function SubmissionsTable({ submissions }: SubmissionsTableProps) {
  if (submissions.length === 0) {
    return <p className="text-callout text-muted">No submissions yet. They appear here as students start the assignment.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-callout text-muted">
        Sorted by review priority, so the submissions that need a conversation come first.
      </p>
      {/* Focusable so keyboard users can scroll the table sideways on small screens. */}
      <div
        role="region"
        aria-label="Submissions table"
        tabIndex={0}
        className="overflow-x-auto rounded-xl border border-line bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        <table className="w-full border-collapse text-callout">
          <caption className="sr-only">Submissions, sorted by review priority</caption>
          <thead className="bg-surface-muted text-footnote text-muted">
            <tr>
              <th scope="col" className={CELL}>Student</th>
              <th scope="col" className={CELL}>Status</th>
              <th scope="col" className={CELL}>Submitted</th>
              <th scope="col" className={CELL}>Review priority</th>
              <th scope="col" className={CELL}>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortByReviewPriority(submissions).map((submission) => (
              <tr key={submission.id} className="last:[&>*]:border-b-0">
                <th scope="row" className={`${CELL} font-medium`}>{submission.student_name}</th>
                <td className={CELL}>{SUBMISSION_STATUS_LABELS[submission.status]}</td>
                <td className={CELL}>
                  {submission.submitted_at ? (
                    <LocalTime iso={submission.submitted_at} />
                  ) : (
                    <span className="text-muted">Not yet</span>
                  )}
                </td>
                <td className={CELL}>
                  {submission.review_priority ? (
                    <ReviewPriorityBadge priority={submission.review_priority} />
                  ) : (
                    <span className="text-muted">After submission</span>
                  )}
                </td>
                <td className={CELL}>
                  <Link
                    href={submissionSummaryRoute(submission.id)}
                    // Every row says "View summary", so screen readers also hear whose summary it is.
                    aria-label={`View summary for ${submission.student_name}`}
                    className="font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                  >
                    View summary
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
