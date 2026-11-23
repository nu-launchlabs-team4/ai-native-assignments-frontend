import { ApiError } from "@/lib/api";
import type { SubmissionOut } from "@/lib/api-types";
import { Step, SubmissionStatus } from "@/lib/constants";

import { hasText } from "./map-submission";
import { getMockAssignment } from "./mock-assignment";
import type { SubmissionClient } from "./submission-client";

// Same messages and status codes as app/submissions/service.py, so the UI is
// exercised exactly as the real backend would exercise it.
const SUBMISSION_NOT_FOUND = "Submission not found";
const ASSIGNMENT_NOT_FOUND = "Assignment not found";
const UNANSWERED = "Answer every question before moving on";
const UNKNOWN_QUESTION = "An answer is for a question that isn't in this assignment";
const MOCK_DELAY_MS = 300;

/** Kept for the browser tab's lifetime, like a real submission between page visits. */
const submissions = new Map<string, SubmissionOut>();

function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
}

function notInStep(step: Step): ApiError {
  return new ApiError(`Not allowed in the ${step} step`, 409, "conflict", null);
}

function getOwned(submissionId: string): SubmissionOut {
  const submission = submissions.get(submissionId);
  if (!submission) {
    throw new ApiError(SUBMISSION_NOT_FOUND, 404, "not_found", null);
  }
  return submission;
}

function update(submission: SubmissionOut): SubmissionOut {
  const updated = { ...submission, updated_at: new Date().toISOString() };
  submissions.set(updated.id, updated);
  return updated;
}

/** In-browser stand-in for the backend, used only by the demo assignment. */
export const mockSubmissionClient: SubmissionClient = {
  async start(assignmentId) {
    await delay();
    const assignment = getMockAssignment(assignmentId);
    if (!assignment) {
      throw new ApiError(ASSIGNMENT_NOT_FOUND, 404, "not_found", null);
    }
    const existing = [...submissions.values()].find((s) => s.assignment_id === assignmentId);
    if (existing) {
      return existing;
    }
    const now = new Date().toISOString();
    return update({
      id: `mock-submission-${assignmentId}`,
      assignment_id: assignmentId,
      status: SubmissionStatus.IN_PROGRESS,
      current_step: Step.ATTEMPT,
      confidence: null,
      approach_note: null,
      attempt_submitted_at: null,
      submitted_at: null,
      created_at: now,
      updated_at: now,
      attempt_answers: {},
      revision_answers: {},
      assignment,
    });
  },

  async saveAttemptAnswers(submissionId, answers) {
    await delay();
    const submission = getOwned(submissionId);
    if (submission.current_step !== Step.ATTEMPT) {
      throw notInStep(submission.current_step);
    }
    const questionIds = new Set(submission.assignment.questions.map((q) => q.id));
    if (Object.keys(answers).some((id) => !questionIds.has(id))) {
      throw new ApiError(UNKNOWN_QUESTION, 422, "validation_error", null);
    }
    return update({ ...submission, attempt_answers: { ...submission.attempt_answers, ...answers } });
  },

  async finishAttempt(submissionId, body) {
    await delay();
    const submission = getOwned(submissionId);
    if (submission.current_step !== Step.ATTEMPT) {
      throw notInStep(submission.current_step);
    }
    const everyAnswered = submission.assignment.questions.every((q) =>
      hasText(submission.attempt_answers[q.id]),
    );
    if (!everyAnswered) {
      throw new ApiError(UNANSWERED, 422, "validation_error", null);
    }
    return update({
      ...submission,
      confidence: body.confidence,
      approach_note: body.approach_note,
      attempt_submitted_at: new Date().toISOString(),
      current_step: Step.FEEDBACK,
    });
  },
};

/** Clears the demo's saved submissions. For tests. */
export function resetMockSubmissions(): void {
  submissions.clear();
}
