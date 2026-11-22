import type { ReviewPriority } from "@/lib/constants";

// Proposed shapes for BE#13 (submissions list and detail) and BE#12 (reasoning summary).
// TODO(dineshbachchani1234): align with the backend schemas once BE#12 and BE#13 land (#11).

// Values the backend will own. They move to lib/constants.ts once the backend adds them.
export const SubmissionStatus = {
  IN_PROGRESS: "in_progress",
  SUBMITTED: "submitted",
} as const;
export type SubmissionStatus = (typeof SubmissionStatus)[keyof typeof SubmissionStatus];

export const SUBMISSION_STATUS_LABELS: Record<SubmissionStatus, string> = {
  [SubmissionStatus.IN_PROGRESS]: "In progress",
  [SubmissionStatus.SUBMITTED]: "Submitted",
};

/** What the student did with one AI suggestion. */
export const SuggestionJudgment = {
  ACCEPTED: "accepted",
  CHANGED: "changed",
  REJECTED: "rejected",
} as const;
export type SuggestionJudgment = (typeof SuggestionJudgment)[keyof typeof SuggestionJudgment];

export const SUGGESTION_JUDGMENT_LABELS: Record<SuggestionJudgment, string> = {
  [SuggestionJudgment.ACCEPTED]: "Accepted",
  [SuggestionJudgment.CHANGED]: "Changed",
  [SuggestionJudgment.REJECTED]: "Rejected",
};

/** One row of the submissions table. */
export interface SubmissionListItem {
  id: string;
  student_name: string;
  status: SubmissionStatus;
  submitted_at: string | null;
  /** Null until the summary is generated after submission. */
  review_priority: ReviewPriority | null;
}

/** The submissions table for one assignment. */
export interface AssignmentSubmissions {
  assignment_id: string;
  assignment_title: string;
  submissions: readonly SubmissionListItem[];
}

export interface AISuggestion {
  text: string;
  judgment: SuggestionJudgment;
}

export interface ConceptSuggestions {
  concept: string;
  suggestions: readonly AISuggestion[];
}

/** The one-screen reasoning summary from the design doc. Never holds a cheating score. */
export interface ReasoningSummary {
  initial_approach: string;
  /** The student's own rating before the AI unlocked, 1 to 5. */
  confidence: number;
  main_misconception: string | null;
  ai_suggestions: readonly ConceptSuggestions[];
  revision_change: string;
  test_cases: readonly string[];
  interview_synthesis: string;
  ai_declaration: string;
  review_priority: ReviewPriority;
  /** Always at least one specific reason, such as "answers do not match the revised code". */
  priority_reasons: readonly string[];
}

export interface SubmissionDetail {
  id: string;
  assignment_id: string;
  assignment_title: string;
  student_name: string;
  status: SubmissionStatus;
  submitted_at: string | null;
  summary: ReasoningSummary | null;
}
