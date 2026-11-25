import { afterEach, describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api";
import { Step, SubmissionStatus } from "@/lib/constants";

import { MOCK_ASSIGNMENT_ID } from "./mock-assignment";
import { mockSubmissionClient as client, resetMockSubmissions } from "./mock-submission-client";

afterEach(() => {
  resetMockSubmissions();
});

const ALL_ANSWERS = { q1: "def count_vowels(t): return 0", q2: "It loops.", q3: "5n+5" };

/** A submission whose attempt is submitted, so it's in the feedback step. */
async function feedbackStep() {
  const submission = await client.start(MOCK_ASSIGNMENT_ID);
  await client.saveAttemptAnswers(submission.id, ALL_ANSWERS);
  return client.finishAttempt(submission.id, { confidence: 3, approach_note: "Plan" });
}

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
  it("starts the revision as a copy of the attempt and keeps the attempt as it was", async () => {
    const submission = await feedbackStep();

    const revising = await client.saveEvaluation(submission.id, { verdict: "incorrect", test_case: "f(0) is 0" });
    await client.saveRevisionAnswers(revising.id, { q2: "It loops over each letter." });
    const latest = await client.start(MOCK_ASSIGNMENT_ID);

    expect(revising.current_step).toBe(Step.REVISE);
    expect(revising.evaluation_verdict).toBe("incorrect");
    expect(latest.revision_answers.q2).toBe("It loops over each letter.");
    expect(latest.attempt_answers.q2).toBe(ALL_ANSWERS.q2);
  });

  it("only takes the evaluation after the attempt, like the backend", async () => {
    const submission = await client.start(MOCK_ASSIGNMENT_ID);

    await expect(
      client.saveEvaluation(submission.id, { verdict: "correct", test_case: "x" }),
    ).rejects.toMatchObject({ status: 409, message: "Not allowed in the attempt step" });
  });

  it("hands in the revision only when every question is answered", async () => {
    const submission = await feedbackStep();
    await client.saveEvaluation(submission.id, { verdict: "correct", test_case: "x" });
    await client.saveRevisionAnswers(submission.id, { q3: "  " });

    await expect(client.finishRevision(submission.id)).rejects.toMatchObject({ status: 422 });

    await client.saveRevisionAnswers(submission.id, { q3: "5n+5" });
    const explaining = await client.finishRevision(submission.id);
    expect(explaining.current_step).toBe(Step.EXPLAIN);
    await expect(client.saveRevisionAnswers(submission.id, { q3: "6" })).rejects.toMatchObject({ status: 409 });
  });
  it("submits the explanation in step 5, once, and offers three questions", async () => {
    const submission = await feedbackStep();
    await client.saveEvaluation(submission.id, { verdict: "correct", test_case: "x" });
    await expect(
      client.saveExplanation(submission.id, { interview_answers: [{ question: "q", answer: "a" }], ai_declaration: "d" }),
    ).rejects.toMatchObject({ status: 409 });
    await client.finishRevision(submission.id);

    expect(await client.getInterviewQuestions(submission.id)).toHaveLength(3);
    const body = { interview_answers: [{ question: "Why?", answer: "Because." }], ai_declaration: "Only the tutor." };
    const submitted = await client.saveExplanation(submission.id, body);

    expect(submitted.status).toBe(SubmissionStatus.SUBMITTED);
    expect(submitted.submitted_at).not.toBeNull();
    expect(submitted.interview_answers).toEqual(body.interview_answers);
    await expect(client.saveExplanation(submission.id, body)).rejects.toMatchObject({
      status: 409,
      message: "This submission is already submitted",
    });
  });
});
