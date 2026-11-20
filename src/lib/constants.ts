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

export const Role = {
  STUDENT: "student",
  PROFESSOR: "professor",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

// Frontend-only values below.

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  STUDENT: "/student",
  PROFESSOR: "/professor",
  STATUS: "/status",
} as const;

/** URL of the student workspace for one assignment. */
export function studentAssignmentRoute(assignmentId: string): string {
  return `${ROUTES.STUDENT}/assignments/${encodeURIComponent(assignmentId)}`;
}

export const API_PATHS = {
  HEALTH: "/health",
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

/** localStorage key that remembers the light or dark choice. */
export const THEME_STORAGE_KEY = "theme";
