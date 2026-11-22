import type { AIPolicy, AnswerType, FinalCheck, HelpLevel } from "@/lib/constants";

// These mirror QuestionOut and AssignmentOut in the backend (app/assignments/schemas.py),
// field names included, so no mapping layer is needed when the API is wired in.

export interface SetupQuestion {
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

export interface SetupAssignment extends AssignmentSettings {
  id: string;
  course_id: string;
  title: string;
  instructions: string;
  source_pdf: string | null;
  /** Null while the assignment is a draft. */
  published_at: string | null;
  created_at: string;
  questions: readonly SetupQuestion[];
}
