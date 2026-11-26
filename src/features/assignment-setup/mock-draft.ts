import { AIPolicy, AnswerType, FinalCheck, HelpLevel } from "@/lib/constants";

import type { SetupAssignment } from "./types";

// A draft shaped like what the PDF parser will return (BE#8): one question of each
// answer type, so the whole review flow can be checked before the backend lands.
/** The course new drafts go into until the professor can pick one. */
export const MOCK_COURSE_ID = "course-1";

export const MOCK_DRAFT: SetupAssignment = {
  id: "draft-1",
  course_id: MOCK_COURSE_ID,
  title: "Week 3: Counting and loops",
  instructions: "Answer each question yourself before you ask the AI tutor for help.",
  source_pdf: "week-3-counting-and-loops.pdf",
  ai_policy: AIPolicy.PERMITTED,
  help_level: HelpLevel.HINTS,
  final_check: FinalCheck.AI_INTERVIEW,
  published_at: null,
  created_at: "2026-11-22T00:00:00Z",
  questions: [
    {
      id: "q1",
      position: 1,
      prompt:
        "Write a function count_vowels(text) that returns how many vowels (a, e, i, o, u) are in a string. Uppercase and lowercase letters both count.",
      answer_type: AnswerType.CODE,
      language: "python",
      starter_code: "def count_vowels(text):\n    pass\n",
    },
    {
      id: "q2",
      position: 2,
      prompt: "Explain in two or three sentences why your loop visits every character exactly once.",
      answer_type: AnswerType.TEXT,
      language: null,
      starter_code: null,
    },
    {
      id: "q3",
      position: 3,
      prompt: "A string has n characters. Write the number of comparisons your function makes as a formula in n.",
      answer_type: AnswerType.MATH,
      language: null,
      starter_code: null,
    },
  ],
};
