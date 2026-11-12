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

export const API_PATHS = {
  HEALTH: "/health",
} as const;

// Names of the httpOnly cookies the backend sets (backend issue #4). The
// frontend only checks that one exists. It never reads or verifies the value.
export const SESSION_COOKIES = ["access_token", "refresh_token"] as const;
