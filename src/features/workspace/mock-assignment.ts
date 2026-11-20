import { AnswerType, Step } from "@/lib/constants";

import type { WorkspaceAssignment } from "./types";

export const MOCK_ASSIGNMENT_ID = "sample-1";

// One question of each answer type, so the workspace can be checked end to end.
const MOCK_ASSIGNMENTS: readonly WorkspaceAssignment[] = [
  {
    id: MOCK_ASSIGNMENT_ID,
    title: "Week 3: Counting and loops",
    instructions: [
      "This assignment has three questions: one in code, one written and one in math.",
      "Before you ask the AI tutor for help, answer each question yourself, rate your confidence and describe your approach.",
    ],
    questions: [
      {
        id: "q1",
        answerType: AnswerType.CODE,
        prompt: [
          "Write a function count_vowels(text) that returns how many vowels (a, e, i, o, u) are in a string.",
          "Uppercase and lowercase letters both count. Letters like y do not count.",
          'For example, count_vowels("Hello World") returns 3, and count_vowels("") returns 0.',
        ],
        language: "python",
        fileName: "solution.py",
        starterAnswer: 'def count_vowels(text):\n    # Your code here\n    pass\n\n\nprint(count_vowels("Hello World"))\n',
      },
      {
        id: "q2",
        answerType: AnswerType.TEXT,
        prompt: [
          "In a few sentences, explain how your count_vowels function works.",
          "Why did you choose a loop, a comprehension or another approach?",
        ],
        starterAnswer: "",
      },
      {
        id: "q3",
        answerType: AnswerType.MATH,
        prompt: [
          "Your function checks each character once. For a string of length n, the work is T(n) = 3n + 2n + 5.",
          "Simplify T(n), showing each step on its own line.",
        ],
        starterAnswer: "",
      },
    ],
    currentStep: Step.ATTEMPT,
  },
];

/**
 * Look up a sample assignment by id. Returns null when it doesn't exist.
 * Stands in for the backend until BE#9 provides real assignments.
 */
export function getMockAssignment(assignmentId: string): WorkspaceAssignment | null {
  return MOCK_ASSIGNMENTS.find((assignment) => assignment.id === assignmentId) ?? null;
}
