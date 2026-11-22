import Link from "next/link";
import type { ReactNode } from "react";

import { submissionTrailRoute } from "@/lib/constants";

import { type ReasoningSummary, SUGGESTION_JUDGMENT_LABELS } from "../types";
import { ReviewPriorityBadge } from "./ReviewPriorityBadge";

interface ReasoningSummaryViewProps {
  submissionId: string;
  studentName: string;
  summary: ReasoningSummary | null;
}

const MAX_CONFIDENCE = 5;

// The summary's lists are fixed once generated and may repeat text, so items are keyed by position.

/**
 * The one-screen summary of how a student reasoned. Review priority and its reasons come
 * first so the professor can decide where to focus. It points; the professor decides.
 */
// TODO(dineshbachchani1234): link each line to its place in the trail once #12 exists (#11).
export function ReasoningSummaryView({ submissionId, studentName, summary }: ReasoningSummaryViewProps) {
  const trailLink = (
    <Link
      href={submissionTrailRoute(submissionId)}
      className="self-start rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      Open the full trail
    </Link>
  );

  if (!summary) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-muted">The summary appears after {studentName} submits the assignment.</p>
        {trailLink}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="priority-heading" className="flex flex-col gap-3 rounded-md border border-line bg-surface-muted p-4">
        <div className="flex flex-wrap items-center gap-3">
          <h2 id="priority-heading" className="text-lg font-semibold">
            Review priority
          </h2>
          <ReviewPriorityBadge priority={summary.review_priority} />
        </div>
        <ul aria-label="Reasons for this priority" className="list-inside list-disc text-sm">
          {summary.priority_reasons.map((reason, index) => (
            <li key={index}>{reason}</li>
          ))}
        </ul>
      </section>

      <dl className="grid gap-x-6 gap-y-5 text-sm sm:grid-cols-[12rem_minmax(0,1fr)]">
        <SummaryPart term="Initial approach">
          <p>{summary.initial_approach}</p>
          <p className="mt-1 text-muted">
            Confidence before the AI unlocked: {summary.confidence} of {MAX_CONFIDENCE}
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
                      <span className="rounded border border-line px-1.5 py-0.5 text-xs">
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
            <ul className="flex flex-col gap-1 font-mono text-xs">
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

      {trailLink}
    </div>
  );
}

function SummaryPart({ term, children }: { term: string; children: ReactNode }) {
  return (
    <>
      <dt className="font-semibold text-muted">{term}</dt>
      <dd>{children}</dd>
    </>
  );
}
