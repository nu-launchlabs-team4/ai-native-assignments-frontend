import type { WorkSession } from "../session-types";
import { SessionCard } from "./SessionCard";
import { TimePerStep } from "./TimePerStep";

/** How a student spent their time: totals per step, then each work session in order. */
export function SessionTimeline({ sessions }: { sessions: readonly WorkSession[] }) {
  if (sessions.length === 0) {
    return <p className="text-callout text-muted">No work sessions yet. They appear here once the student opens the assignment.</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      <p className="rounded-xl border border-line bg-surface-muted p-4 text-callout">
        Activity signals give context for a conversation. They are not evidence that the student did anything wrong.
      </p>

      <section aria-labelledby="time-per-step-heading" className="flex flex-col gap-3">
        <h2 id="time-per-step-heading" className="text-title">
          Time per step
        </h2>
        <TimePerStep sessions={sessions} />
      </section>

      <section aria-labelledby="sessions-heading" className="flex flex-col gap-3">
        <h2 id="sessions-heading" className="text-title">
          Sessions
        </h2>
        <ol aria-label="Sessions, oldest first" className="flex flex-col gap-3">
          {sessions.map((session, index) => (
            <li key={session.id}>
              <SessionCard session={session} number={index + 1} />
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
