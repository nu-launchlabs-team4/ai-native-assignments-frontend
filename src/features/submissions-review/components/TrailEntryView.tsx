import type { ReactNode } from "react";

import { AnswerType, ChatRole, Step, STEP_LABELS } from "@/lib/constants";

import { formatDateTime } from "../format";
import { EVALUATION_VERDICT_LABELS, type TrailAnswer, type TrailEntry, TrailEntryKind } from "../types";
import { RevisionDiff } from "./RevisionDiff";

const MAX_CONFIDENCE = 5;

/** One entry in the trail: a heading, its step and time, and what the student or AI wrote. */
export function TrailEntryView({ entry }: { entry: TrailEntry }) {
  const { title, step, body } = describe(entry);
  const headingId = `trail-${entry.id}`;

  return (
    <article aria-labelledby={headingId} className="flex flex-col gap-2 rounded-md border border-line bg-surface p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id={headingId} className="text-sm font-semibold">
          {title}
        </h2>
        <p className="text-xs text-muted">
          {STEP_LABELS[step]} step · <time dateTime={entry.created_at}>{formatDateTime(entry.created_at)}</time>
        </p>
      </div>
      <div className="text-sm">{body}</div>
    </article>
  );
}

function describe(entry: TrailEntry): { title: string; step: Step; body: ReactNode } {
  switch (entry.kind) {
    case TrailEntryKind.ATTEMPT:
      return {
        title: "First attempt",
        step: Step.ATTEMPT,
        body: (
          <div className="flex flex-col gap-3">
            <p>
              <span className="font-medium">Approach:</span> {entry.approach_note}
            </p>
            <p className="text-muted">
              Confidence before the AI unlocked: {entry.confidence} of {MAX_CONFIDENCE}
            </p>
            {entry.answers.map((answer) => (
              <Answer key={answer.question_number} answer={answer} />
            ))}
          </div>
        ),
      };
    case TrailEntryKind.CHAT:
      return {
        title: entry.role === ChatRole.STUDENT ? "Student asked the AI tutor" : "AI tutor replied",
        step: entry.step,
        body: <p className="whitespace-pre-wrap">{entry.content}</p>,
      };
    case TrailEntryKind.EVALUATION:
      return {
        title: `Judged the AI's feedback as ${EVALUATION_VERDICT_LABELS[entry.verdict].toLowerCase()}`,
        step: Step.EVALUATE,
        body: (
          <div className="flex flex-col gap-2">
            <p>{entry.reasoning}</p>
            <p>
              <span className="font-medium">Test case:</span> <code className="font-mono text-xs">{entry.test_case}</code>
            </p>
          </div>
        ),
      };
    case TrailEntryKind.REVISION:
      return { title: "Revised the attempt", step: Step.REVISE, body: <RevisionDiff answers={entry.answers} /> };
    case TrailEntryKind.INTERVIEW:
      return {
        title: `Interview: ${entry.question}`,
        step: Step.EXPLAIN,
        body: <p className="whitespace-pre-wrap">{entry.answer}</p>,
      };
    case TrailEntryKind.DECLARATION:
      return { title: "Declared what the AI contributed", step: Step.EXPLAIN, body: <p>{entry.text}</p> };
    default: {
      // TypeScript flags this line if a new entry kind is added without a case above.
      const unhandled: never = entry;
      return unhandled;
    }
  }
}

function Answer({ answer }: { answer: TrailAnswer }) {
  return (
    <figure className="flex flex-col gap-1">
      <figcaption className="text-xs font-medium text-muted">Question {answer.question_number}</figcaption>
      {answer.answer_type === AnswerType.TEXT ? (
        <p className="whitespace-pre-wrap">{answer.content}</p>
      ) : (
        <pre className="overflow-x-auto rounded border border-line bg-surface-muted p-3 font-mono text-xs leading-5">{answer.content}</pre>
      )}
    </figure>
  );
}
