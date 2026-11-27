import { loadChatHistory } from "@/features/chat/api";
import type { ChatMessage } from "@/features/chat/types";
import { apiFetch } from "@/lib/api";
import type { AnswerMap, InterviewAnswer, SubmissionOut } from "@/lib/api-types";
import { API_PATHS, type EvaluationVerdict } from "@/lib/constants";

import { MOCK_ASSIGNMENT_ID } from "./mock-assignment";
import { mockSubmissionClient } from "./mock-submission-client";

export interface FinishAttemptBody {
  confidence: number;
  approach_note: string;
}

export interface EvaluationBody {
  verdict: EvaluationVerdict;
  /** A test case or example that backs up the verdict. */
  test_case: string;
}

export interface ExplanationBody {
  interview_answers: InterviewAnswer[];
  ai_declaration: string;
}

type SaveOptions = { keepalive?: boolean };

/** The submission calls the workspace makes. Every call returns the updated submission. */
export interface SubmissionClient {
  /** Start the student's submission, or get the one they already have. */
  start(assignmentId: string): Promise<SubmissionOut>;
  /** Save draft answers. Only the questions sent change. */
  saveAttemptAnswers(submissionId: string, answers: AnswerMap, options?: SaveOptions): Promise<SubmissionOut>;
  /** Submit the attempt: moves the submission to the feedback step. */
  finishAttempt(submissionId: string, body: FinishAttemptBody): Promise<SubmissionOut>;
  /** Judge the AI feedback. The revision starts as a copy of the attempt, in the revise step. */
  saveEvaluation(submissionId: string, body: EvaluationBody): Promise<SubmissionOut>;
  /** Save draft revision answers. Only the questions sent change; the attempt stays as it was. */
  saveRevisionAnswers(submissionId: string, answers: AnswerMap, options?: SaveOptions): Promise<SubmissionOut>;
  /** Hand in the revision: moves the submission to the explain step. */
  finishRevision(submissionId: string): Promise<SubmissionOut>;
  /** The conversation with the AI tutor so far, oldest first. */
  getChatHistory(submissionId: string): Promise<ChatMessage[]>;
  /** Step 5's follow-up questions, generated from the student's own work. */
  getInterviewQuestions(submissionId: string): Promise<string[]>;
  /** Answer the follow-up questions and declare AI use. This submits the submission for good. */
  saveExplanation(submissionId: string, body: ExplanationBody): Promise<SubmissionOut>;
}

function submissionPath(submissionId: string, ...rest: string[]): string {
  return [API_PATHS.SUBMISSIONS, encodeURIComponent(submissionId), ...rest].join("/");
}

/** Talks to the backend's /submissions endpoints. */
export const apiSubmissionClient: SubmissionClient = {
  start: (assignmentId) =>
    apiFetch<SubmissionOut>(API_PATHS.SUBMISSIONS, {
      method: "POST",
      body: { assignment_id: assignmentId },
    }),
  saveAttemptAnswers: (submissionId, answers, options) =>
    apiFetch<SubmissionOut>(submissionPath(submissionId, "attempt", "answers"), {
      method: "PUT",
      body: { answers },
      // Lets the save finish even when the student closes the tab.
      keepalive: options?.keepalive,
    }),
  finishAttempt: (submissionId, body) =>
    apiFetch<SubmissionOut>(submissionPath(submissionId, "attempt"), { method: "POST", body }),
  saveEvaluation: (submissionId, body) =>
    apiFetch<SubmissionOut>(submissionPath(submissionId, "evaluation"), { method: "POST", body }),
  saveRevisionAnswers: (submissionId, answers, options) =>
    apiFetch<SubmissionOut>(submissionPath(submissionId, "revision", "answers"), {
      method: "PUT",
      body: { answers },
      keepalive: options?.keepalive,
    }),
  finishRevision: (submissionId) =>
    apiFetch<SubmissionOut>(submissionPath(submissionId, "revision"), { method: "POST" }),
  getChatHistory: loadChatHistory,
  // TODO(akashshetty1997): confirm this path and shape with backend #11 (interview questions).
  getInterviewQuestions: async (submissionId) =>
    (await apiFetch<{ questions: string[] }>(submissionPath(submissionId, "interview-questions"))).questions,
  saveExplanation: (submissionId, body) =>
    apiFetch<SubmissionOut>(submissionPath(submissionId, "explanation"), { method: "POST", body }),
};

/** The demo assignment runs in the browser. Every real assignment uses the backend. */
export function submissionClientFor(assignmentId: string): SubmissionClient {
  return assignmentId === MOCK_ASSIGNMENT_ID ? mockSubmissionClient : apiSubmissionClient;
}
