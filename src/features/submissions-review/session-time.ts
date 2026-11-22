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

/** Time spent in a session, counted from its step segments. */
export function sessionSeconds(session: WorkSession): number {
  return session.segments.reduce((total, segment) => total + segmentSeconds(segment), 0);
}

/** Total seconds in each step across all sessions, in step order, including steps never reached. */
export function timePerStep(sessions: readonly WorkSession[]): { step: Step; seconds: number }[] {
  const totals = new Map<Step, number>(STEP_ORDER.map((step) => [step, 0]));
  for (const session of sessions) {
    for (const segment of session.segments) {
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
