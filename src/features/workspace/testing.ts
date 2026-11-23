import type { SubmissionOut } from "@/lib/api-types";
import { Step, SubmissionStatus } from "@/lib/constants";

import { getMockAssignment, MOCK_ASSIGNMENT_ID } from "./mock-assignment";

/** A backend-shaped submission for the demo assignment. For tests. */
export function buildSubmission(overrides: Partial<SubmissionOut> = {}): SubmissionOut {
  return {
    id: "sub-1",
    assignment_id: MOCK_ASSIGNMENT_ID,
    status: SubmissionStatus.IN_PROGRESS,
    current_step: Step.ATTEMPT,
    confidence: null,
    approach_note: null,
    attempt_submitted_at: null,
    submitted_at: null,
    created_at: "2026-11-23T00:00:00Z",
    updated_at: "2026-11-23T00:00:00Z",
    attempt_answers: {},
    revision_answers: {},
    assignment: getMockAssignment(MOCK_ASSIGNMENT_ID)!,
    ...overrides,
  };
}
