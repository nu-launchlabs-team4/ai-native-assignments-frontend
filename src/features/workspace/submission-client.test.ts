import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiFetch } from "@/lib/api";

import { MOCK_ASSIGNMENT_ID } from "./mock-assignment";
import { mockSubmissionClient } from "./mock-submission-client";
import { apiSubmissionClient, submissionClientFor } from "./submission-client";

vi.mock("@/lib/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api")>()),
  apiFetch: vi.fn().mockResolvedValue({}),
}));

beforeEach(() => {
  vi.mocked(apiFetch).mockClear();
});

describe("apiSubmissionClient", () => {
  it("starts a submission with POST /submissions", async () => {
    await apiSubmissionClient.start("a-1");

    expect(apiFetch).toHaveBeenCalledWith("/submissions", {
      method: "POST",
      body: { assignment_id: "a-1" },
    });
  });

  it("saves draft answers with PUT and passes keepalive through", async () => {
    await apiSubmissionClient.saveAttemptAnswers("s-1", { q1: "x" }, { keepalive: true });

    expect(apiFetch).toHaveBeenCalledWith("/submissions/s-1/attempt/answers", {
      method: "PUT",
      body: { answers: { q1: "x" } },
      keepalive: true,
    });
  });

  it("finishes the attempt with POST", async () => {
    await apiSubmissionClient.finishAttempt("s-1", { confidence: 3, approach_note: "Plan" });

    expect(apiFetch).toHaveBeenCalledWith("/submissions/s-1/attempt", {
      method: "POST",
      body: { confidence: 3, approach_note: "Plan" },
    });
  });

  it("saves the evaluation with POST", async () => {
    await apiSubmissionClient.saveEvaluation("s-1", { verdict: "correct", test_case: "f(1) is 1" });

    expect(apiFetch).toHaveBeenCalledWith("/submissions/s-1/evaluation", {
      method: "POST",
      body: { verdict: "correct", test_case: "f(1) is 1" },
    });
  });

  it("saves revision answers with PUT and passes keepalive through", async () => {
    await apiSubmissionClient.saveRevisionAnswers("s-1", { q2: "y" }, { keepalive: true });

    expect(apiFetch).toHaveBeenCalledWith("/submissions/s-1/revision/answers", {
      method: "PUT",
      body: { answers: { q2: "y" } },
      keepalive: true,
    });
  });

  it("hands in the revision with POST", async () => {
    await apiSubmissionClient.finishRevision("s-1");

    expect(apiFetch).toHaveBeenCalledWith("/submissions/s-1/revision", { method: "POST" });
  });
});

describe("submissionClientFor", () => {
  it("uses the in-browser mock only for the demo assignment", () => {
    expect(submissionClientFor(MOCK_ASSIGNMENT_ID)).toBe(mockSubmissionClient);
    expect(submissionClientFor("3f2a8c1e-0000-4000-8000-000000000000")).toBe(apiSubmissionClient);
  });
});
