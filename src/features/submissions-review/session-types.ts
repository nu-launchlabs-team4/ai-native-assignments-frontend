import type { Step } from "@/lib/constants";

// The professor's read of backend #14, as proposed on that issue: sessions with their events.
// Event fields match what the student workspace sends (features/workspace/activity-client.ts).

/** What the student's browser logs during a session. These are signals for context, never flags. */
export const ActivityEventType = {
  PASTE: "paste",
  TAB_LEAVE: "tab_leave",
  TAB_RETURN: "tab_return",
  SNAPSHOT: "snapshot",
} as const;
export type ActivityEventType = (typeof ActivityEventType)[keyof typeof ActivityEventType];

interface ActivityEventBase {
  id: string;
  step: Step;
  occurred_at: string;
}

export type ActivityEvent = ActivityEventBase &
  (
    | { type: typeof ActivityEventType.PASTE; detail: { characters: number } }
    | { type: typeof ActivityEventType.TAB_LEAVE }
    | { type: typeof ActivityEventType.TAB_RETURN }
    | { type: typeof ActivityEventType.SNAPSHOT }
  );

/** A stretch of a session spent on one step, worked out from the events (see sessionSegments). */
export interface StepSegment {
  step: Step;
  started_at: string;
  ended_at: string;
}

/** Work between opening the assignment and pausing or closing it. */
export interface WorkSession {
  id: string;
  started_at: string;
  /** `null` while the session is still open. */
  ended_at: string | null;
  /** Oldest first. Each carries the step the student was on. */
  events: ActivityEvent[];
}

export interface SubmissionSessions {
  submission_id: string;
  assignment_title: string;
  student_name: string;
  /** Oldest first. */
  sessions: WorkSession[];
}
