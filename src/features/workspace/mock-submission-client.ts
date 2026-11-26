import { ApiError } from "@/lib/api";
import type { AnswerMap, SubmissionOut } from "@/lib/api-types";
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
const ALREADY_SUBMITTED = "This submission is already submitted";

// Stand-ins for backend #11's generated questions, written for the demo assignment.
const SAMPLE_INTERVIEW_QUESTIONS = [
  "Walk through what your count_vowels function does with the input \"Sky!\". What does it return, and why?",
  "What changed between your attempt and your revision, and what made you change it?",
  "Your T(n) simplifies to 5n + 5. What would the work look like if the function also counted consonants?",
];
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

function requireStep(submission: SubmissionOut, ...steps: Step[]): void {
  if (submission.status === SubmissionStatus.SUBMITTED) {
    throw new ApiError(ALREADY_SUBMITTED, 409, "conflict", null);
  }
  if (!steps.includes(submission.current_step)) {
    throw notInStep(submission.current_step);
  }
}

function requireKnownQuestions(submission: SubmissionOut, answers: AnswerMap): void {
  const questionIds = new Set(submission.assignment.questions.map((q) => q.id));
  if (Object.keys(answers).some((id) => !questionIds.has(id))) {
    throw new ApiError(UNKNOWN_QUESTION, 422, "validation_error", null);
  }
}

function requireEveryAnswered(submission: SubmissionOut, answers: AnswerMap): void {
  if (!submission.assignment.questions.every((q) => hasText(answers[q.id]))) {
    throw new ApiError(UNANSWERED, 422, "validation_error", null);
  }
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
      evaluation_verdict: null,
      evaluation_test_case: null,
      interview_answers: null,
      ai_declaration: null,
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
    requireStep(submission, Step.ATTEMPT);
    requireKnownQuestions(submission, answers);
    return update({ ...submission, attempt_answers: { ...submission.attempt_answers, ...answers } });
  },

  async finishAttempt(submissionId, body) {
    await delay();
    const submission = getOwned(submissionId);
    requireStep(submission, Step.ATTEMPT);
    requireEveryAnswered(submission, submission.attempt_answers);
    return update({
      ...submission,
      confidence: body.confidence,
      approach_note: body.approach_note,
      attempt_submitted_at: new Date().toISOString(),
      current_step: Step.FEEDBACK,
    });
  },

  async saveEvaluation(submissionId, body) {
    await delay();
    const submission = getOwned(submissionId);
    requireStep(submission, Step.FEEDBACK, Step.EVALUATE);
    return update({
      ...submission,
      evaluation_verdict: body.verdict,
      evaluation_test_case: body.test_case,
      // The revision starts as a copy of the attempt. The attempt itself stays as it was.
      revision_answers: { ...submission.attempt_answers },
      current_step: Step.REVISE,
    });
  },

  async saveRevisionAnswers(submissionId, answers) {
    await delay();
    const submission = getOwned(submissionId);
    requireStep(submission, Step.REVISE);
    requireKnownQuestions(submission, answers);
    return update({ ...submission, revision_answers: { ...submission.revision_answers, ...answers } });
  },

  async finishRevision(submissionId) {
    await delay();
    const submission = getOwned(submissionId);
    requireStep(submission, Step.REVISE);
    requireEveryAnswered(submission, submission.revision_answers);
    return update({ ...submission, current_step: Step.EXPLAIN });
  },

  async getInterviewQuestions(submissionId) {
    await delay();
    getOwned(submissionId);
    return [...SAMPLE_INTERVIEW_QUESTIONS];
  },

  async saveExplanation(submissionId, body) {
    await delay();
    const submission = getOwned(submissionId);
    requireStep(submission, Step.EXPLAIN);
    return update({
      ...submission,
      interview_answers: body.interview_answers,
      ai_declaration: body.ai_declaration,
      status: SubmissionStatus.SUBMITTED,
      submitted_at: new Date().toISOString(),
    });
  },
};

/** Clears the demo's saved submissions. For tests. */
export function resetMockSubmissions(): void {
  submissions.clear();
}
