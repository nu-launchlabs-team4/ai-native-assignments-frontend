import { STEP_ORDER, type Step } from "@/lib/constants";

import type { StepSegment, WorkSession } from "./session-types";

const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;

/** Whole seconds between two ISO timestamps. */
export function secondsBetween(startIso: string, endIso: string): number {
  return Math.max(0, Math.round((Date.parse(endIso) - Date.parse(startIso)) / 1000));
}

function segmentSeconds(segment: StepSegment): number {
  return secondsBetween(segment.started_at, segment.ended_at);
}

/** When the session's time stops counting: its end, or its latest event while it's still open. */
function sessionEnd(session: WorkSession): string {
  return session.ended_at ?? session.events.at(-1)?.occurred_at ?? session.started_at;
}

/**
 * The stretches of a session spent in each step, from its events. The first step runs from
 * the session's start; a new step starts at its first event; the last runs to the session's end.
 * The backend saves the answers every 30 seconds while the student works, so the events are
 * close together and a switch is placed within about half a minute.
 */
export function sessionSegments(session: WorkSession): StepSegment[] {
  const end = sessionEnd(session);
  const segments: StepSegment[] = [];
  for (const event of session.events) {
    const current = segments.at(-1);
    if (!current) {
      segments.push({ step: event.step, started_at: session.started_at, ended_at: end });
    } else if (current.step !== event.step) {
      current.ended_at = event.occurred_at;
      segments.push({ step: event.step, started_at: event.occurred_at, ended_at: end });
    }
  }
  return segments;
}

/** Time spent in a session, from its start to its end (or its latest event while open). */
export function sessionSeconds(session: WorkSession): number {
  return sessionSegments(session).reduce((total, segment) => total + segmentSeconds(segment), 0);
}

/** Total seconds in each step across all sessions, in step order, including steps never reached. */
export function timePerStep(sessions: readonly WorkSession[]): { step: Step; seconds: number }[] {
  const totals = new Map<Step, number>(STEP_ORDER.map((step) => [step, 0]));
  for (const session of sessions) {
    for (const segment of sessionSegments(session)) {
      totals.set(segment.step, (totals.get(segment.step) ?? 0) + segmentSeconds(segment));
    }
  }
  return STEP_ORDER.map((step) => ({ step, seconds: totals.get(step) ?? 0 }));
}

/** A short, readable duration such as "under 1 min", "42 min" or "1 h 5 min". */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / SECONDS_PER_MINUTE);
  if (minutes < 1) {
    return "under 1 min";
  }
  const hours = Math.floor(minutes / MINUTES_PER_HOUR);
  const rest = minutes % MINUTES_PER_HOUR;
  if (hours === 0) {
    return `${minutes} min`;
  }
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}
