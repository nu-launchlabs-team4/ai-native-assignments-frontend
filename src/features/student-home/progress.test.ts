import { describe, expect, it } from "vitest";

import type { StudentAssignmentOut } from "@/lib/api-types";
import { Step, SubmissionStatus } from "@/lib/constants";

import { progressLabel } from "./progress";

const BASE: StudentAssignmentOut = {
  id: "a1",
  title: "Week 3",
  course_id: "c1",
  course_title: "Intro to Programming",
  published_at: "2026-11-20T00:00:00Z",
  submission_id: null,
  status: null,
  current_step: null,
};

describe("progressLabel", () => {
  it("says not started before the student opens it", () => {
    expect(progressLabel(BASE)).toBe("Not started");
  });

  it("names the step while it's in progress", () => {
    const evaluating = { ...BASE, submission_id: "s1", status: SubmissionStatus.IN_PROGRESS, current_step: Step.EVALUATE };
    expect(progressLabel(evaluating)).toBe("Step 3 of 5: Evaluate");
  });

  it("says submitted once handed in", () => {
    const done = { ...BASE, submission_id: "s1", status: SubmissionStatus.SUBMITTED, current_step: Step.EXPLAIN };
    expect(progressLabel(done)).toBe("Submitted");
  });
});
