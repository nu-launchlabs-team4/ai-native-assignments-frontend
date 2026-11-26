import { Step } from "@/lib/constants";

import { MOCK_REVIEW_ASSIGNMENT_TITLE } from "./mock-submissions";
import { ActivityEventType, type SubmissionSessions } from "./session-types";

// TODO(dineshbachchani1234): remove once the sessions endpoint from backend #14 exists (#14).
const MOCK_SESSIONS: readonly SubmissionSessions[] = [
  {
    submission_id: "sub-1",
    assignment_title: MOCK_REVIEW_ASSIGNMENT_TITLE,
    student_name: "Alex Rivera",
    sessions: [
      {
        id: "s1-1",
        started_at: "2026-11-19T22:00:00Z",
        ended_at: "2026-11-19T22:40:00Z",
        segments: [
          { step: Step.ATTEMPT, started_at: "2026-11-19T22:00:00Z", ended_at: "2026-11-19T22:25:00Z" },
          { step: Step.FEEDBACK, started_at: "2026-11-19T22:25:00Z", ended_at: "2026-11-19T22:40:00Z" },
        ],
        events: [
          { id: "e1", type: ActivityEventType.SNAPSHOT, step: Step.ATTEMPT, created_at: "2026-11-19T22:05:00Z" },
          { id: "e2", type: ActivityEventType.TAB_LEAVE, step: Step.ATTEMPT, created_at: "2026-11-19T22:10:00Z" },
          { id: "e3", type: ActivityEventType.TAB_RETURN, step: Step.ATTEMPT, created_at: "2026-11-19T22:13:00Z" },
          { id: "e4", type: ActivityEventType.SNAPSHOT, step: Step.ATTEMPT, created_at: "2026-11-19T22:20:00Z" },
          {
            id: "e5",
            type: ActivityEventType.PASTE,
            step: Step.FEEDBACK,
            created_at: "2026-11-19T22:31:00Z",
            detail: { characters: 42 },
          },
        ],
      },
      {
        id: "s1-2",
        started_at: "2026-11-20T17:40:00Z",
        ended_at: "2026-11-20T18:30:00Z",
        segments: [
          { step: Step.EVALUATE, started_at: "2026-11-20T17:40:00Z", ended_at: "2026-11-20T17:50:00Z" },
          { step: Step.REVISE, started_at: "2026-11-20T17:50:00Z", ended_at: "2026-11-20T18:10:00Z" },
          { step: Step.EXPLAIN, started_at: "2026-11-20T18:10:00Z", ended_at: "2026-11-20T18:30:00Z" },
        ],
        events: [
          { id: "e6", type: ActivityEventType.SNAPSHOT, step: Step.REVISE, created_at: "2026-11-20T18:00:00Z" },
        ],
      },
    ],
  },
  {
    submission_id: "sub-2",
    assignment_title: MOCK_REVIEW_ASSIGNMENT_TITLE,
    student_name: "Sam Patel",
    sessions: [
      {
        id: "s2-1",
        started_at: "2026-11-21T01:30:00Z",
        ended_at: "2026-11-21T02:10:00Z",
        segments: [
          { step: Step.ATTEMPT, started_at: "2026-11-21T01:30:00Z", ended_at: "2026-11-21T01:34:00Z" },
          { step: Step.FEEDBACK, started_at: "2026-11-21T01:34:00Z", ended_at: "2026-11-21T01:44:00Z" },
          { step: Step.EVALUATE, started_at: "2026-11-21T01:44:00Z", ended_at: "2026-11-21T01:45:00Z" },
          { step: Step.REVISE, started_at: "2026-11-21T01:45:00Z", ended_at: "2026-11-21T02:00:00Z" },
          { step: Step.EXPLAIN, started_at: "2026-11-21T02:00:00Z", ended_at: "2026-11-21T02:10:00Z" },
        ],
        events: [
          { id: "e7", type: ActivityEventType.TAB_LEAVE, step: Step.ATTEMPT, created_at: "2026-11-21T01:31:00Z" },
          { id: "e8", type: ActivityEventType.TAB_RETURN, step: Step.ATTEMPT, created_at: "2026-11-21T01:33:00Z" },
          {
            id: "e9",
            type: ActivityEventType.PASTE,
            step: Step.ATTEMPT,
            created_at: "2026-11-21T01:33:30Z",
            detail: { characters: 610 },
          },
          { id: "e10", type: ActivityEventType.TAB_LEAVE, step: Step.REVISE, created_at: "2026-11-21T01:50:00Z" },
          { id: "e11", type: ActivityEventType.TAB_RETURN, step: Step.REVISE, created_at: "2026-11-21T01:58:00Z" },
        ],
      },
    ],
  },
  {
    submission_id: "sub-3",
    assignment_title: MOCK_REVIEW_ASSIGNMENT_TITLE,
    student_name: "Jordan Lee",
    sessions: [
      {
        id: "s3-1",
        started_at: "2026-11-21T15:00:00Z",
        ended_at: null,
        segments: [
          { step: Step.ATTEMPT, started_at: "2026-11-21T15:00:00Z", ended_at: "2026-11-21T15:12:00Z" },
        ],
        events: [
          { id: "e12", type: ActivityEventType.SNAPSHOT, step: Step.ATTEMPT, created_at: "2026-11-21T15:10:00Z" },
        ],
      },
    ],
  },
];

/** Sample sessions for one submission, or `undefined` if the id is unknown. */
export function getMockSessions(submissionId: string): SubmissionSessions | undefined {
  return MOCK_SESSIONS.find((entry) => entry.submission_id === submissionId);
}
