import { ReviewPriority } from "@/lib/constants";

import { type AssignmentSubmissions, type SubmissionDetail, SubmissionStatus, SuggestionJudgment } from "./types";

export const MOCK_REVIEW_ASSIGNMENT_ID = "sample-1";
const ASSIGNMENT_TITLE = "Week 3: Counting and loops";

// Sample data until BE#12 and BE#13 land: one submission per review priority, plus one
// still in progress, so every state of the table and summary can be checked.
const MOCK_SUBMISSIONS: readonly SubmissionDetail[] = [
  {
    id: "sub-1",
    assignment_id: MOCK_REVIEW_ASSIGNMENT_ID,
    assignment_title: ASSIGNMENT_TITLE,
    student_name: "Alex Rivera",
    status: SubmissionStatus.SUBMITTED,
    submitted_at: "2026-11-20T18:30:00Z",
    summary: {
      initial_approach:
        "Planned to loop over each character and count it when it is in a set of vowels. Lowercased the text first so uppercase letters count.",
      confidence: 4,
      main_misconception: null,
      ai_suggestions: [
        {
          concept: "Edge cases",
          suggestions: [{ text: "Check what happens with an empty string.", judgment: SuggestionJudgment.ACCEPTED }],
        },
      ],
      revision_change: "Added a test for the empty string. The loop logic did not change.",
      test_cases: ['count_vowels("Hello World") == 3', 'count_vowels("") == 0'],
      interview_synthesis: "Explained why a set makes the lookup simple and why lowercasing first is needed.",
      ai_declaration: "The AI reminded me to test the empty string.",
      review_priority: ReviewPriority.ROUTINE,
      priority_reasons: ["The revision matches the student's own explanation in the interview."],
    },
  },
  {
    id: "sub-2",
    assignment_id: MOCK_REVIEW_ASSIGNMENT_ID,
    assignment_title: ASSIGNMENT_TITLE,
    student_name: "Sam Patel",
    status: SubmissionStatus.SUBMITTED,
    submitted_at: "2026-11-21T02:10:00Z",
    summary: {
      initial_approach: "Counted vowels with a chain of if statements for each letter.",
      confidence: 5,
      main_misconception: "Believed uppercase letters are already handled by the comparison.",
      ai_suggestions: [
        {
          concept: "Case handling",
          suggestions: [{ text: "Think about what happens with capital letters.", judgment: SuggestionJudgment.CHANGED }],
        },
        {
          concept: "Code structure",
          suggestions: [{ text: "Consider a collection of vowels instead of five checks.", judgment: SuggestionJudgment.REJECTED }],
        },
      ],
      revision_change: "Rewrote the function to use a set of vowels and lowercase the input.",
      test_cases: [],
      interview_synthesis: "Could not explain why the revised version handles uppercase letters.",
      ai_declaration: "None.",
      review_priority: ReviewPriority.NEEDS_CONVERSATION,
      priority_reasons: [
        "The interview answers do not match the revised code.",
        "The AI declaration says none, but the revision follows a suggestion the student marked as rejected.",
        "No test cases were used to evaluate the AI's feedback.",
      ],
    },
  },
  {
    id: "sub-3",
    assignment_id: MOCK_REVIEW_ASSIGNMENT_ID,
    assignment_title: ASSIGNMENT_TITLE,
    student_name: "Jordan Lee",
    status: SubmissionStatus.IN_PROGRESS,
    submitted_at: null,
    summary: null,
  },
];

/** An assignment's submissions table, or null if the assignment is unknown. */
export function getMockSubmissions(assignmentId: string): AssignmentSubmissions | null {
  if (assignmentId !== MOCK_REVIEW_ASSIGNMENT_ID) {
    return null;
  }
  return {
    assignment_id: assignmentId,
    assignment_title: ASSIGNMENT_TITLE,
    submissions: MOCK_SUBMISSIONS.map(({ id, student_name, status, submitted_at, summary }) => ({
      id,
      student_name,
      status,
      submitted_at,
      review_priority: summary?.review_priority ?? null,
    })),
  };
}

/** One submission with its summary, or null if it is unknown. */
export function getMockSubmission(submissionId: string): SubmissionDetail | null {
  return MOCK_SUBMISSIONS.find((submission) => submission.id === submissionId) ?? null;
}
