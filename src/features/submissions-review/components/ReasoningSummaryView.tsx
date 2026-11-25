import Link from "next/link";
import type { ReactNode } from "react";

import { buttonClassName } from "@/components/ui/Button";
import { CONFIDENCE_MAX, submissionSessionsRoute, submissionTrailRoute } from "@/lib/constants";

import { type ReasoningSummary, SUGGESTION_JUDGMENT_LABELS } from "../types";
import { ReviewPriorityBadge } from "./ReviewPriorityBadge";

interface ReasoningSummaryViewProps {
  submissionId: string;
  studentName: string;
  summary: ReasoningSummary | null;
}

// The summary's lists are fixed once generated and may repeat text, so items are keyed by position.

/**
 * The one-screen summary of how a student reasoned. Review priority and its reasons come
 * first so the professor can decide where to focus. It points; the professor decides.
 */
// TODO(dineshbachchani1234): link each line to its place in the trail once #12 exists (#11).
export function ReasoningSummaryView({ submissionId, studentName, summary }: ReasoningSummaryViewProps) {
  const reviewLinks = (
    <div className="flex flex-wrap gap-3">
      <Link
        href={submissionTrailRoute(submissionId)}
        className={buttonClassName({ variant: "filled" })}
      >
        Open the full trail
      </Link>
      <Link
        href={submissionSessionsRoute(submissionId)}
        className={buttonClassName({ variant: "tinted" })}
      >
        See work sessions
      </Link>
    </div>
  );

  if (!summary) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-body text-muted">The summary appears after {studentName} submits the assignment.</p>
        {reviewLinks}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="priority-heading" className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-5">
        <div className="flex flex-wrap items-center gap-3">
          <h2 id="priority-heading" className="text-title">
            Review priority
          </h2>
          <ReviewPriorityBadge priority={summary.review_priority} />
        </div>
        <ul aria-label="Reasons for this priority" className="list-inside list-disc text-body">
          {summary.priority_reasons.map((reason, index) => (
            <li key={index}>{reason}</li>
          ))}
        </ul>
      </section>

      <dl className="grid gap-x-6 gap-y-5 rounded-xl border border-line bg-surface p-5 text-body sm:grid-cols-[12rem_minmax(0,1fr)]">
        <SummaryPart term="Initial approach">
          <p>{summary.initial_approach}</p>
          <p className="mt-1 text-callout text-muted">
            Confidence before the AI unlocked: {summary.confidence} of {CONFIDENCE_MAX}
          </p>
        </SummaryPart>
        <SummaryPart term="Main misconception">
          {summary.main_misconception ?? <span className="text-muted">None identified</span>}
        </SummaryPart>
        <SummaryPart term="AI suggestions">
          <ul className="flex flex-col gap-2">
            {summary.ai_suggestions.map((group, groupIndex) => (
              <li key={groupIndex}>
                <p className="font-medium">{group.concept}</p>
                <ul className="mt-1 flex flex-col gap-1">
                  {group.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex flex-wrap items-baseline gap-2">
                      <span className="rounded-full bg-fill px-2 py-0.5 text-caption font-medium">
                        {SUGGESTION_JUDGMENT_LABELS[suggestion.judgment]}
                      </span>
                      <span>{suggestion.text}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </SummaryPart>
        <SummaryPart term="Revision change">{summary.revision_change}</SummaryPart>
        <SummaryPart term="Test cases used">
          {summary.test_cases.length > 0 ? (
            <ul className="flex flex-col gap-1 font-mono text-footnote">
              {summary.test_cases.map((testCase, index) => (
                <li key={index}>{testCase}</li>
              ))}
            </ul>
          ) : (
            <span className="text-muted">None</span>
          )}
        </SummaryPart>
        <SummaryPart term="Interview answers">{summary.interview_synthesis}</SummaryPart>
        <SummaryPart term="AI declaration">{summary.ai_declaration}</SummaryPart>
      </dl>

      {reviewLinks}
    </div>
  );
}

function SummaryPart({ term, children }: { term: string; children: ReactNode }) {
  return (
    <>
      <dt className="text-callout font-semibold text-muted">{term}</dt>
      <dd>{children}</dd>
    </>
  );
}
