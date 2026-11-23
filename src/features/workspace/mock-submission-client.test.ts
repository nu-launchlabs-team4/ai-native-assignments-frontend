import { afterEach, describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api";
import { Step } from "@/lib/constants";

import { MOCK_ASSIGNMENT_ID } from "./mock-assignment";
import { mockSubmissionClient as client, resetMockSubmissions } from "./mock-submission-client";

afterEach(() => {
  resetMockSubmissions();
});

const ALL_ANSWERS = { q1: "def count_vowels(t): return 0", q2: "It loops.", q3: "5n+5" };

describe("mockSubmissionClient", () => {
  it("starts once and resumes the same submission", async () => {
    const first = await client.start(MOCK_ASSIGNMENT_ID);
    await client.saveAttemptAnswers(first.id, { q2: "Draft" });

    const again = await client.start(MOCK_ASSIGNMENT_ID);

    expect(again.id).toBe(first.id);
    expect(again.attempt_answers.q2).toBe("Draft");
  });

  it("returns 404 for an unknown assignment", async () => {
    await expect(client.start("nope")).rejects.toMatchObject({ status: 404 });
  });

  it("rejects finishing before every question is answered, like the backend", async () => {
    const submission = await client.start(MOCK_ASSIGNMENT_ID);
    await client.saveAttemptAnswers(submission.id, { q1: "x", q2: "y" });

    const error = await client.finishAttempt(submission.id, { confidence: 3, approach_note: "Plan" }).catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 422, message: "Answer every question before moving on" });
  });

  it("moves to the feedback step when finished, then refuses more answers", async () => {
    const submission = await client.start(MOCK_ASSIGNMENT_ID);
    await client.saveAttemptAnswers(submission.id, ALL_ANSWERS);

    const finished = await client.finishAttempt(submission.id, { confidence: 4, approach_note: "Plan" });

    expect(finished.current_step).toBe(Step.FEEDBACK);
    expect(finished.confidence).toBe(4);
    await expect(client.saveAttemptAnswers(submission.id, { q1: "late" })).rejects.toMatchObject({
      status: 409,
    });
  });
});
