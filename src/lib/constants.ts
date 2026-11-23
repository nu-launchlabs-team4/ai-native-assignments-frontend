// Must stay in sync with app/core/constants.py in the backend repo
// (nu-launchlabs-team4/ai-native-assignments-backend). Change both together.

export const Step = {
  ATTEMPT: "attempt",
  FEEDBACK: "feedback",
  EVALUATE: "evaluate",
  REVISE: "revise",
  EXPLAIN: "explain",
} as const;
export type Step = (typeof Step)[keyof typeof Step];

/** The five steps in the order a student works through them. */
export const STEP_ORDER: readonly Step[] = [
  Step.ATTEMPT,
  Step.FEEDBACK,
  Step.EVALUATE,
  Step.REVISE,
  Step.EXPLAIN,
];

export const STEP_LABELS: Record<Step, string> = {
  [Step.ATTEMPT]: "Attempt",
  [Step.FEEDBACK]: "Feedback",
  [Step.EVALUATE]: "Evaluate",
  [Step.REVISE]: "Revise",
  [Step.EXPLAIN]: "Explain",
};

/** How a question is answered. The PDF parser detects it, and the professor can correct it. */
export const AnswerType = {
  CODE: "code",
  TEXT: "text",
  MATH: "math",
} as const;
export type AnswerType = (typeof AnswerType)[keyof typeof AnswerType];

export const ANSWER_TYPE_LABELS: Record<AnswerType, string> = {
  [AnswerType.CODE]: "Code",
  [AnswerType.TEXT]: "Written",
  [AnswerType.MATH]: "Math",
};

export const AIPolicy = {
  PROHIBITED: "prohibited",
  PERMITTED: "permitted",
  EXPECTED: "expected",
} as const;
export type AIPolicy = (typeof AIPolicy)[keyof typeof AIPolicy];

export const HelpLevel = {
  HINTS: "hints",
  APPROACH: "approach",
  CONCEPTS: "concepts",
} as const;
export type HelpLevel = (typeof HelpLevel)[keyof typeof HelpLevel];

export const FinalCheck = {
  AI_INTERVIEW: "ai_interview",
  QUESTIONNAIRE: "questionnaire",
} as const;
export type FinalCheck = (typeof FinalCheck)[keyof typeof FinalCheck];

export const ReviewPriority = {
  ROUTINE: "routine",
  WORTH_REVIEWING: "worth_reviewing",
  NEEDS_CONVERSATION: "needs_conversation",
} as const;
export type ReviewPriority = (typeof ReviewPriority)[keyof typeof ReviewPriority];

/** Largest PDF a professor can upload, in megabytes. */
export const MAX_PDF_MB = 10;

export const Role = {
  STUDENT: "student",
  PROFESSOR: "professor",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const SubmissionStatus = {
  IN_PROGRESS: "in_progress",
  SUBMITTED: "submitted",
} as const;
export type SubmissionStatus = (typeof SubmissionStatus)[keyof typeof SubmissionStatus];

/** The student's confidence in their attempt, from 1 (not sure) to 5 (very sure). */
export const CONFIDENCE_MIN = 1;
export const CONFIDENCE_MAX = 5;

export const MAX_APPROACH_NOTE_CHARS = 1000;

// Frontend-only values below.

export const REVIEW_PRIORITY_LABELS: Record<ReviewPriority, string> = {
  [ReviewPriority.ROUTINE]: "Routine",
  [ReviewPriority.WORTH_REVIEWING]: "Worth reviewing",
  [ReviewPriority.NEEDS_CONVERSATION]: "Needs a conversation",
};

export const AI_POLICY_LABELS: Record<AIPolicy, string> = {
  [AIPolicy.PROHIBITED]: "Prohibited",
  [AIPolicy.PERMITTED]: "Permitted",
  [AIPolicy.EXPECTED]: "Expected",
};

export const HELP_LEVEL_LABELS: Record<HelpLevel, string> = {
  [HelpLevel.HINTS]: "Hints only",
  [HelpLevel.APPROACH]: "Feedback on approach",
  [HelpLevel.CONCEPTS]: "Concept explanations",
};

export const FINAL_CHECK_LABELS: Record<FinalCheck, string> = {
  [FinalCheck.AI_INTERVIEW]: "AI follow-up interview",
  [FinalCheck.QUESTIONNAIRE]: "Fixed questionnaire",
};

/** Languages a professor can pick for a code question. Ids are Monaco language ids. */
export const CODE_LANGUAGES = [
  { id: "python", label: "Python" },
  { id: "java", label: "Java" },
  { id: "javascript", label: "JavaScript" },
  { id: "typescript", label: "TypeScript" },
  { id: "c", label: "C" },
  { id: "cpp", label: "C++" },
] as const;

/** Language a question gets when the professor switches it to code. */
export const DEFAULT_CODE_LANGUAGE = "python";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  STUDENT: "/student",
  PROFESSOR: "/professor",
  PROFESSOR_NEW_ASSIGNMENT: "/professor/assignments/new",
  STATUS: "/status",
} as const;

/** URL of the student workspace for one assignment. */
export function studentAssignmentRoute(assignmentId: string): string {
  return `${ROUTES.STUDENT}/assignments/${encodeURIComponent(assignmentId)}`;
}

/** URL of the submissions table for one of the professor's assignments. */
export function assignmentSubmissionsRoute(assignmentId: string): string {
  return `${ROUTES.PROFESSOR}/assignments/${encodeURIComponent(assignmentId)}/submissions`;
}

/** URL of the reasoning summary for one submission. */
export function submissionSummaryRoute(submissionId: string): string {
  return `${ROUTES.PROFESSOR}/submissions/${encodeURIComponent(submissionId)}`;
}

/** URL of the full trail for one submission. */
export function submissionTrailRoute(submissionId: string): string {
  return `${submissionSummaryRoute(submissionId)}/trail`;
}

/** URL of the work sessions timeline for one submission. */
export function submissionSessionsRoute(submissionId: string): string {
  return `${submissionSummaryRoute(submissionId)}/sessions`;
}

/** How often the workspace saves changed answers. */
export const AUTOSAVE_INTERVAL_MS = 30_000;

export const API_PATHS = {
  HEALTH: "/health",
  SUBMISSIONS: "/submissions",
  // TODO(singhsaravjit): confirm the path and body with backend #10 (AI chat endpoint).
  AI_CHAT: "/ai/chat",
} as const;

export const ChatRole = {
  STUDENT: "student",
  ASSISTANT: "assistant",
} as const;
export type ChatRole = (typeof ChatRole)[keyof typeof ChatRole];

export const CHAT_MAX_MESSAGE_LENGTH = 4000;

// Names of the httpOnly cookies the backend sets (backend issue #4). The
// frontend only checks that one exists. It never reads or verifies the value.
export const SESSION_COOKIES = ["access_token", "refresh_token"] as const;

/** localStorage key that remembers a light or dark choice. Absent means "follow the device". */
export const THEME_STORAGE_KEY = "theme";

export const DARK_SCHEME_QUERY = "(prefers-color-scheme: dark)";
