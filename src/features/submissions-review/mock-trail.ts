import { AnswerType, ChatRole, EvaluationVerdict, Step } from "@/lib/constants";

import { getMockSubmission } from "./mock-submissions";
import { type SubmissionTrail, type TrailEntry, TrailEntryKind } from "./types";

const ATTEMPT_CODE = 'def count_vowels(text):\n    count = 0\n    for ch in text.lower():\n        if ch in "aeiou":\n            count += 1\n    return count';

// Sample trails until BE#13 lands. Alex's covers every kind of entry; Jordan has not saved work yet.
const MOCK_TRAIL_ENTRIES: Readonly<Record<string, readonly TrailEntry[]>> = {
  "sub-1": [
    {
      id: "e1",
      kind: TrailEntryKind.ATTEMPT,
      created_at: "2026-11-20T16:05:00Z",
      confidence: 4,
      approach_note: "Loop over each character, lowercase first, and count the ones in a set of vowels.",
      answers: [
        { question_number: 1, answer_type: AnswerType.CODE, content: ATTEMPT_CODE },
        { question_number: 2, answer_type: AnswerType.TEXT, content: "The for loop moves one character forward each time and stops at the end." },
        { question_number: 3, answer_type: AnswerType.MATH, content: "C(n) = n" },
      ],
    },
    { id: "e2", kind: TrailEntryKind.CHAT, created_at: "2026-11-20T16:20:00Z", step: Step.FEEDBACK, role: ChatRole.STUDENT, content: "Is my loop correct?" },
    {
      id: "e3",
      kind: TrailEntryKind.CHAT,
      created_at: "2026-11-20T16:20:30Z",
      step: Step.FEEDBACK,
      role: ChatRole.ASSISTANT,
      content: "Your loop visits each character once. What does your function return for an empty string, and have you tested it?",
    },
    {
      id: "e4",
      kind: TrailEntryKind.EVALUATION,
      created_at: "2026-11-20T16:40:00Z",
      verdict: EvaluationVerdict.PARTLY_CORRECT,
      test_case: 'count_vowels("") == 0',
      reasoning: "The empty string already worked, but I had not tested it, so the hint was useful.",
    },
    {
      id: "e5",
      kind: TrailEntryKind.REVISION,
      created_at: "2026-11-20T17:00:00Z",
      answers: [
        { question_number: 1, answer_type: AnswerType.CODE, before: ATTEMPT_CODE, after: `${ATTEMPT_CODE}\n\n\nassert count_vowels("") == 0` },
      ],
    },
    { id: "e6", kind: TrailEntryKind.INTERVIEW, created_at: "2026-11-20T18:10:00Z", question: "Why did you lowercase the text first?", answer: "So I only need to check five letters instead of ten." },
    { id: "e7", kind: TrailEntryKind.INTERVIEW, created_at: "2026-11-20T18:12:00Z", question: "Which AI suggestion did you use, and why?", answer: "Testing the empty string, because I had not thought about it." },
    { id: "e8", kind: TrailEntryKind.INTERVIEW, created_at: "2026-11-20T18:15:00Z", question: "What would break if the input had accented vowels?", answer: "They would not be counted, since é is not in my set." },
    { id: "e9", kind: TrailEntryKind.DECLARATION, created_at: "2026-11-20T18:30:00Z", text: "The AI reminded me to test the empty string." },
  ],
  "sub-2": [
    {
      id: "e1",
      kind: TrailEntryKind.ATTEMPT,
      created_at: "2026-11-20T23:00:00Z",
      confidence: 5,
      approach_note: "Check each letter with an if statement.",
      answers: [{ question_number: 1, answer_type: AnswerType.CODE, content: 'def count_vowels(text):\n    count = 0\n    for ch in text:\n        if ch == "a" or ch == "e":\n            count += 1\n    return count' }],
    },
    {
      id: "e2",
      kind: TrailEntryKind.REVISION,
      created_at: "2026-11-21T01:30:00Z",
      answers: [
        {
          question_number: 1,
          answer_type: AnswerType.CODE,
          before: 'def count_vowels(text):\n    count = 0\n    for ch in text:\n        if ch == "a" or ch == "e":\n            count += 1\n    return count',
          after: 'def count_vowels(text):\n    count = 0\n    for ch in text.lower():\n        if ch in set("aeiou"):\n            count += 1\n    return count',
        },
      ],
    },
  ],
};

/** A submission's full trail, or null if the submission is unknown. */
export function getMockTrail(submissionId: string): SubmissionTrail | null {
  const submission = getMockSubmission(submissionId);
  if (!submission) {
    return null;
  }
  return {
    submission_id: submission.id,
    assignment_title: submission.assignment_title,
    student_name: submission.student_name,
    entries: MOCK_TRAIL_ENTRIES[submission.id] ?? [],
  };
}
