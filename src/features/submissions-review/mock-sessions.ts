import { Step } from "@/lib/constants";

import { MOCK_REVIEW_ASSIGNMENT_TITLE } from "./mock-submissions";
import {
  type ActivityEvent,
  ActivityEventType,
  type StepSegment,
  type SubmissionSessions,
  type WorkSession,
} from "./session-types";

// TODO(dineshbachchani1234): remove with the sample submissions once backend #13 lists real ones (#11).
// Snapshots fall at each step change, as the backend's 30-second saves would.

/** A sample event. Pass `characters` for a paste. */
export function mockEvent(
  id: string,
  type: ActivityEventType,
  step: Step,
  created_at: string,
  characters?: number,
): ActivityEvent {
  const detail = characters === undefined ? null : { characters };
  return { id, type, step, created_at, question_id: null, detail };
}

/** The backend's segments rule: a step starts at its first event, the last runs to the session's end. */
export function mockSession(
  id: string,
  started_at: string,
  ended_at: string | null,
  events: ActivityEvent[],
): WorkSession {
  const end = ended_at ?? events.at(-1)?.created_at ?? started_at;
  const segments: StepSegment[] = [];
  for (const { step, created_at } of events) {
    const current = segments.at(-1);
    if (current?.step === step) continue;
    if (current) current.ended_at = created_at;
    segments.push({ step, started_at: current ? created_at : started_at, ended_at: end });
  }
  return { id, started_at, ended_at, segments, events };
}

const MOCK_SESSIONS: readonly SubmissionSessions[] = [
  {
    submission_id: "sub-1",
    assignment_title: MOCK_REVIEW_ASSIGNMENT_TITLE,
    student_name: "Alex Rivera",
    sessions: [
      mockSession("s1-1", "2026-11-19T22:00:00Z", "2026-11-19T22:40:00Z", [
        mockEvent("e1", ActivityEventType.SNAPSHOT, Step.ATTEMPT, "2026-11-19T22:05:00Z"),
        mockEvent("e2", ActivityEventType.TAB_LEAVE, Step.ATTEMPT, "2026-11-19T22:10:00Z"),
        mockEvent("e3", ActivityEventType.TAB_RETURN, Step.ATTEMPT, "2026-11-19T22:13:00Z"),
        mockEvent("e4", ActivityEventType.SNAPSHOT, Step.ATTEMPT, "2026-11-19T22:20:00Z"),
        mockEvent("e5", ActivityEventType.SNAPSHOT, Step.FEEDBACK, "2026-11-19T22:25:00Z"),
        mockEvent("e6", ActivityEventType.PASTE, Step.FEEDBACK, "2026-11-19T22:31:00Z", 42),
      ]),
      mockSession("s1-2", "2026-11-20T17:40:00Z", "2026-11-20T18:30:00Z", [
        mockEvent("e7", ActivityEventType.SNAPSHOT, Step.EVALUATE, "2026-11-20T17:41:00Z"),
        mockEvent("e8", ActivityEventType.SNAPSHOT, Step.REVISE, "2026-11-20T17:50:00Z"),
        mockEvent("e9", ActivityEventType.SNAPSHOT, Step.REVISE, "2026-11-20T18:00:00Z"),
        mockEvent("e10", ActivityEventType.SNAPSHOT, Step.EXPLAIN, "2026-11-20T18:10:00Z"),
      ]),
    ],
  },
  {
    submission_id: "sub-2",
    assignment_title: MOCK_REVIEW_ASSIGNMENT_TITLE,
    student_name: "Sam Patel",
    sessions: [
      mockSession("s2-1", "2026-11-21T01:30:00Z", "2026-11-21T02:10:00Z", [
        mockEvent("e11", ActivityEventType.TAB_LEAVE, Step.ATTEMPT, "2026-11-21T01:31:00Z"),
        mockEvent("e12", ActivityEventType.TAB_RETURN, Step.ATTEMPT, "2026-11-21T01:33:00Z"),
        mockEvent("e13", ActivityEventType.PASTE, Step.ATTEMPT, "2026-11-21T01:33:30Z", 610),
        mockEvent("e14", ActivityEventType.SNAPSHOT, Step.FEEDBACK, "2026-11-21T01:34:00Z"),
        mockEvent("e15", ActivityEventType.SNAPSHOT, Step.EVALUATE, "2026-11-21T01:44:00Z"),
        mockEvent("e16", ActivityEventType.SNAPSHOT, Step.REVISE, "2026-11-21T01:45:00Z"),
        mockEvent("e17", ActivityEventType.TAB_LEAVE, Step.REVISE, "2026-11-21T01:50:00Z"),
        mockEvent("e18", ActivityEventType.TAB_RETURN, Step.REVISE, "2026-11-21T01:58:00Z"),
        mockEvent("e19", ActivityEventType.SNAPSHOT, Step.EXPLAIN, "2026-11-21T02:00:00Z"),
      ]),
    ],
  },
  {
    submission_id: "sub-3",
    assignment_title: MOCK_REVIEW_ASSIGNMENT_TITLE,
    student_name: "Jordan Lee",
    sessions: [
      mockSession("s3-1", "2026-11-21T15:00:00Z", null, [
        mockEvent("e20", ActivityEventType.SNAPSHOT, Step.ATTEMPT, "2026-11-21T15:10:00Z"),
        mockEvent("e21", ActivityEventType.SNAPSHOT, Step.ATTEMPT, "2026-11-21T15:12:00Z"),
      ]),
    ],
  },
];

/** Sample sessions for one submission, or `undefined` if the id is unknown. */
export function getMockSessions(submissionId: string): SubmissionSessions | undefined {
  return MOCK_SESSIONS.find((entry) => entry.submission_id === submissionId);
}
