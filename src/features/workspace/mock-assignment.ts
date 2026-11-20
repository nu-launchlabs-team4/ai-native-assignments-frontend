import { Step } from "@/lib/constants";

import type { WorkspaceAssignment } from "./types";

export const MOCK_ASSIGNMENT_ID = "sample-1";

const MOCK_ASSIGNMENTS: readonly WorkspaceAssignment[] = [
  {
    id: MOCK_ASSIGNMENT_ID,
    title: "Count the vowels",
    instructions: [
      "Write a function count_vowels(text) that returns how many vowels (a, e, i, o, u) are in a string.",
      "Uppercase and lowercase letters both count. Letters like y do not count.",
      'For example, count_vowels("Hello World") returns 3, and count_vowels("") returns 0.',
      "Before you ask the AI tutor for help, write your own attempt, rate your confidence and describe your approach.",
    ],
    language: "python",
    starterCode: 'def count_vowels(text):\n    # Your code here\n    pass\n\n\nprint(count_vowels("Hello World"))\n',
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
