import type { components } from "@/lib/api-schema";

// The professor's timeline from backend #14 (GET /submissions/{id}/sessions), generated from its schema.

type Schemas = components["schemas"];

/** What a work session records. These are signals for context, never flags. */
export const ActivityEventType = {
  PASTE: "paste",
  TAB_LEAVE: "tab_leave",
  TAB_RETURN: "tab_return",
  SNAPSHOT: "snapshot",
} as const satisfies Record<string, Schemas["ActivityEventType"]>;
export type ActivityEventType = Schemas["ActivityEventType"];

/**
 * One event. `created_at` is when it happened. `detail` is `{characters}` for a paste and
 * `{question_ids}` (the answers that changed) for a snapshot.
 */
export type ActivityEvent = Schemas["ActivityEventOut"];

/** A stretch of a session spent on one step. The backend works these out from the events. */
export type StepSegment = Schemas["StepSegmentOut"];

/** Work between opening the assignment and pausing or closing it. `ended_at` is null while open. */
export type WorkSession = Schemas["WorkSessionDetailOut"];

/** One submission's sessions, oldest first. `student_name` is the email until accounts have names. */
export type SubmissionSessions = Schemas["SubmissionSessionsOut"];

/** How many characters a paste had, or 0 if the event carries no size. */
export function pastedCharacters(event: ActivityEvent): number {
  const characters = event.detail?.characters;
  return typeof characters === "number" ? characters : 0;
}
