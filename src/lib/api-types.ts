import type {
  AIPolicy,
  AnswerType,
  EvaluationVerdict,
  FinalCheck,
  HelpLevel,
  Step,
  SubmissionStatus,
} from "@/lib/constants";

// Mirrors of the backend's response schemas, field names included, so no mapping
// layer is needed between the API and the app. Keep in sync with
// app/assignments/schemas.py and app/submissions/schemas.py in the backend.

/** QuestionOut */
export interface QuestionOut {
  id: string;
  /** 1-based order in the assignment. */
  position: number;
  prompt: string;
  answer_type: AnswerType;
  /** Monaco language id, such as "python". Set only for code questions. */
  language: string | null;
  starter_code: string | null;
}

export interface AssignmentSettings {
  ai_policy: AIPolicy;
  help_level: HelpLevel;
  final_check: FinalCheck;
}

/** AssignmentOut */
export interface AssignmentOut extends AssignmentSettings {
  id: string;
  course_id: string;
  title: string;
  instructions: string;
  source_pdf: string | null;
  /** Null while the assignment is a draft. */
  published_at: string | null;
  created_at: string;
  questions: readonly QuestionOut[];
}

/** Answers keyed by question id. Math answers are LaTeX lines separated by "\n". */
export type AnswerMap = Record<string, string>;

/** InterviewAnswer: one follow-up question and the student's answer (step 5). */
export interface InterviewAnswer {
  question: string;
  answer: string;
}

/** SubmissionOut */
export interface SubmissionOut {
  id: string;
  assignment_id: string;
  status: SubmissionStatus;
  current_step: Step;
  confidence: number | null;
  approach_note: string | null;
  attempt_submitted_at: string | null;
  /** Step 3: the student's judgement of the AI feedback, and the test case or example behind it. */
  evaluation_verdict: EvaluationVerdict | null;
  evaluation_test_case: string | null;
  /** Step 5. */
  interview_answers: InterviewAnswer[] | null;
  ai_declaration: string | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
  attempt_answers: AnswerMap;
  revision_answers: AnswerMap;
  /** The assignment and its questions, so the workspace needs one request. */
  assignment: AssignmentOut;
}
