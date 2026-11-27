import type { components } from "./api-schema";

// The backend's response schemas, generated from its OpenAPI schema into api-schema.ts
// (run `npm run api-types` after the backend changes). Feature code imports these names,
// so a renamed or removed field fails the type check instead of breaking a page.

type Schemas = components["schemas"];

/** A course as its professor sees it, with the code students join with. */
export type CourseOut = Schemas["CourseOut"];

/** One question. `position` is 1-based; `language` is a Monaco id, set only for code questions. */
export type QuestionOut = Schemas["QuestionOut"];

/** An assignment with its questions. `published_at` is null while it's a draft. */
export type AssignmentOut = Schemas["AssignmentOut"];

/** The three AI settings a professor chooses for an assignment. */
export type AssignmentSettings = Pick<AssignmentOut, "ai_policy" | "help_level" | "final_check">;

/** One follow-up question and the student's answer (step 5). */
export type InterviewAnswer = Schemas["InterviewAnswer"];

/** A student's submission, with the assignment and its questions so the workspace needs one request. */
export type SubmissionOut = Schemas["SubmissionOut"];

/** Answers keyed by question id. Math answers are LaTeX lines separated by "\n". */
export type AnswerMap = SubmissionOut["attempt_answers"];

/** The signed-in account. The role comes from the backend, never from the client. */
export type UserOut = Schemas["UserOut"];

/** The sign-up result. `user` is null while the email waits to be confirmed. */
export type SignupOut = Schemas["SignupOut"];
