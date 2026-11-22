import { describe, expect, it } from "vitest";

import { ReviewPriority } from "@/lib/constants";

import { sortByReviewPriority } from "./sort";
import { type SubmissionListItem, SubmissionStatus } from "./types";

function item(student_name: string, review_priority: ReviewPriority | null): SubmissionListItem {
  return { id: student_name, student_name, status: SubmissionStatus.SUBMITTED, submitted_at: null, review_priority };
}

describe("sortByReviewPriority", () => {
  it("puts the submissions that need attention first and those without a summary last", () => {
    const sorted = sortByReviewPriority([
      item("A", null),
      item("B", ReviewPriority.ROUTINE),
      item("C", ReviewPriority.NEEDS_CONVERSATION),
      item("D", ReviewPriority.WORTH_REVIEWING),
    ]);
    expect(sorted.map((submission) => submission.student_name)).toEqual(["C", "D", "B", "A"]);
  });

  it("orders students alphabetically within the same priority", () => {
    const sorted = sortByReviewPriority([item("Zoe", ReviewPriority.ROUTINE), item("Ana", ReviewPriority.ROUTINE)]);
    expect(sorted.map((submission) => submission.student_name)).toEqual(["Ana", "Zoe"]);
  });
});
