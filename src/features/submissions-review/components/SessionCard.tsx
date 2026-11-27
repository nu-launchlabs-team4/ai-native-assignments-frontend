import { STEP_LABELS, type Step } from "@/lib/constants";

import { formatDuration, secondsBetween, sessionSeconds } from "../session-time";
import { type ActivityEvent, ActivityEventType, pastedCharacters, type WorkSession } from "../session-types";
import { LocalTime } from "./LocalTime";

interface MarkedEvent {
  id: string;
  step: Step;
  created_at: string;
  text: string;
}

/**
 * The events worth showing a professor: pastes, and time away from the tab (a leave joined
 * with the return that follows it). Snapshots are counted instead of listed.
 */
function markedEvents(events: readonly ActivityEvent[]): MarkedEvent[] {
  const marked: MarkedEvent[] = [];
  let openLeave: MarkedEvent | null = null;
  for (const event of events) {
    if (event.type === ActivityEventType.PASTE) {
      marked.push({ ...event, text: `Pasted ${pastedCharacters(event)} characters` });
    } else if (event.type === ActivityEventType.TAB_LEAVE) {
      openLeave = { ...event, text: "Left the tab" };
      marked.push(openLeave);
    } else if (event.type === ActivityEventType.TAB_RETURN && openLeave) {
      openLeave.text = `Away from the tab for ${formatDuration(secondsBetween(openLeave.created_at, event.created_at))}`;
      openLeave = null;
    }
  }
  return marked;
}

/** One work session: when it ran, the steps worked on and its marked events. */
export function SessionCard({ session, number }: { session: WorkSession; number: number }) {
  const headingId = `session-${session.id}`;
  const duration = formatDuration(sessionSeconds(session));
  const marked = markedEvents(session.events);
  const snapshots = session.events.filter((event) => event.type === ActivityEventType.SNAPSHOT).length;

  return (
    <article aria-labelledby={headingId} className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 id={headingId} className="text-headline">
          Session {number}
        </h3>
        <p className="text-footnote text-muted">
          <LocalTime iso={session.started_at} />
          {session.ended_at ? ` · ${duration}` : ` · Still open, ${duration} so far`}
        </p>
      </div>

      <ul aria-label={`Steps in session ${number}`} className="flex flex-wrap gap-2 text-footnote">
        {session.segments.map((segment) => (
          <li key={segment.started_at} className="rounded-full bg-fill px-2.5 py-0.5">
            {STEP_LABELS[segment.step]} {formatDuration(secondsBetween(segment.started_at, segment.ended_at))}
          </li>
        ))}
      </ul>

      {marked.length > 0 ? (
        <ol aria-label={`Marked events in session ${number}`} className="flex flex-col gap-1 text-callout">
          {marked.map((event) => (
            <li key={event.id} className="flex flex-wrap gap-x-2">
              <LocalTime iso={event.created_at} show="time" className="text-muted" />
              <span className="text-muted">{STEP_LABELS[event.step]} step</span>
              <span>{event.text}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-callout text-muted">No marked events.</p>
      )}

      <p className="text-footnote text-muted">
        {snapshots} {snapshots === 1 ? "snapshot" : "snapshots"} of the answers saved
      </p>
    </article>
  );
}
