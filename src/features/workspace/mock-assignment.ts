import type { AssignmentOut } from "@/lib/api-types";
import { AIPolicy, AnswerType, FinalCheck, HelpLevel } from "@/lib/constants";

/** The demo assignment. It isn't a UUID, so it can never clash with a real one. */
export const MOCK_ASSIGNMENT_ID = "sample-1";

// One question of each answer type, in the backend's own shape, so the demo goes
// through the same code as real assignments. Paragraphs are separated by blank lines.
const MOCK_ASSIGNMENT: AssignmentOut = {
  id: MOCK_ASSIGNMENT_ID,
  course_id: "sample-course",
  title: "Week 3: Counting and loops",
  instructions:
    "This assignment has three questions: one in code, one written and one in math.\n\n" +
    "Before you ask the AI tutor for help, answer each question yourself, rate your confidence and describe your approach.",
  source_pdf: null,
  ai_policy: AIPolicy.PERMITTED,
  help_level: HelpLevel.HINTS,
  final_check: FinalCheck.AI_INTERVIEW,
  published_at: "2026-11-20T00:00:00Z",
  created_at: "2026-11-20T00:00:00Z",
  questions: [
    {
      id: "q1",
      position: 1,
      answer_type: AnswerType.CODE,
      prompt:
        "Write a function count_vowels(text) that returns how many vowels (a, e, i, o, u) are in a string.\n\n" +
        "Uppercase and lowercase letters both count. Letters like y do not count.\n\n" +
        'For example, count_vowels("Hello World") returns 3, and count_vowels("") returns 0.',
      language: "python",
      starter_code: 'def count_vowels(text):\n    # Your code here\n    pass\n\n\nprint(count_vowels("Hello World"))\n',
    },
    {
      id: "q2",
      position: 2,
      answer_type: AnswerType.TEXT,
      prompt:
        "In a few sentences, explain how your count_vowels function works.\n\n" +
        "Why did you choose a loop, a comprehension or another approach?",
      language: null,
      starter_code: null,
    },
    {
      id: "q3",
      position: 3,
      answer_type: AnswerType.MATH,
      prompt:
        "Your function checks each character once. For a string of length n, the work is T(n) = 3n + 2n + 5.\n\n" +
        "Simplify T(n), showing each step on its own line.",
      language: null,
      starter_code: null,
    },
  ],
};

/**
 * Look up the demo assignment by id. Returns null when it doesn't exist.
 * Real assignments come from the backend through the submission client.
 */
export function getMockAssignment(assignmentId: string): AssignmentOut | null {
  return assignmentId === MOCK_ASSIGNMENT_ID ? MOCK_ASSIGNMENT : null;
}
