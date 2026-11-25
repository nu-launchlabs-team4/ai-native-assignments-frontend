import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api";
import type { SubmissionOut } from "@/lib/api-types";
import { AUTOSAVE_INTERVAL_MS, Step } from "@/lib/constants";

import type { SubmissionClient } from "./submission-client";
import { buildSubmission } from "./testing";
import { useAnswers } from "./use-answers";

function fakeClient(overrides: Partial<SubmissionClient> = {}): SubmissionClient {
  return {
    start: vi.fn(),
    saveAttemptAnswers: vi.fn().mockResolvedValue(buildSubmission()),
    finishAttempt: vi.fn().mockResolvedValue(buildSubmission({ current_step: Step.FEEDBACK })),
    saveEvaluation: vi.fn(),
    saveRevisionAnswers: vi.fn().mockResolvedValue(buildSubmission({ current_step: Step.REVISE })),
    finishRevision: vi.fn().mockResolvedValue(buildSubmission({ current_step: Step.EXPLAIN })),
    ...overrides,
  };
}

// Everything already saved, so only the edits made in a test count as changes.
const SAVED: SubmissionOut = buildSubmission({ attempt_answers: { q1: "def f(): pass", q2: "", q3: "" } });

async function tick(ms = AUTOSAVE_INTERVAL_MS) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useAnswers", () => {
  it("autosaves only the changed answers every 30 seconds", async () => {
    const client = fakeClient();
    const { result } = renderHook(() => useAnswers(client, SAVED));

    act(() => result.current.setAnswer("q2", "My explanation"));
    expect(result.current.saveStatus).toBe("unsaved");
    expect(client.saveAttemptAnswers).not.toHaveBeenCalled();

    await tick();

    expect(client.saveAttemptAnswers).toHaveBeenCalledTimes(1);
    expect(client.saveAttemptAnswers).toHaveBeenCalledWith("sub-1", { q2: "My explanation" }, undefined);
    expect(result.current.saveStatus).toBe("saved");
    expect(result.current.lastSavedAt).not.toBeNull();
  });

  it("does nothing on a tick with no changes", async () => {
    const client = fakeClient();
    renderHook(() => useAnswers(client, SAVED));

    await tick();

    expect(client.saveAttemptAnswers).not.toHaveBeenCalled();
  });

  it("keeps an edit made during a save for the next save", async () => {
    let finishSave: () => void = () => {};
    const client = fakeClient({
      saveAttemptAnswers: vi
        .fn()
        .mockImplementationOnce(
          () => new Promise<SubmissionOut>((resolve) => (finishSave = () => resolve(SAVED))),
        )
        .mockResolvedValue(SAVED),
    });
    const { result } = renderHook(() => useAnswers(client, SAVED));

    act(() => result.current.setAnswer("q2", "First"));
    await tick();
    act(() => result.current.setAnswer("q2", "Second"));
    await act(async () => finishSave());

    expect(result.current.saveStatus).toBe("unsaved");
    await tick();
    expect(client.saveAttemptAnswers).toHaveBeenLastCalledWith("sub-1", { q2: "Second" }, undefined);
  });

  it("saves unsaved starter code before finishing, then finishes", async () => {
    const client = fakeClient();
    // Nothing saved yet: the code question's starter code still has to reach the backend.
    const { result } = renderHook(() => useAnswers(client, buildSubmission()));

    await act(() => result.current.finishAttempt(4, "  Loop over each letter.  "));

    const saved = vi.mocked(client.saveAttemptAnswers).mock.calls[0][1];
    expect(saved.q1).toContain("def count_vowels");
    expect(client.finishAttempt).toHaveBeenCalledWith("sub-1", {
      confidence: 4,
      approach_note: "Loop over each letter.",
    });
    expect(result.current.submission.current_step).toBe(Step.FEEDBACK);
  });

  it("shows the backend's message when finishing fails", async () => {
    const client = fakeClient({
      finishAttempt: vi
        .fn()
        .mockRejectedValue(new ApiError("Answer every question before moving on", 422, "validation_error", null)),
    });
    const { result } = renderHook(() => useAnswers(client, SAVED));

    await act(() => result.current.finishAttempt(3, "Plan"));

    expect(result.current.submitError).toBe("Answer every question before moving on");
    expect(result.current.submission.current_step).toBe(Step.ATTEMPT);
  });

  it("stops autosaving once the attempt is submitted", async () => {
    const client = fakeClient();
    const { result } = renderHook(() => useAnswers(client, SAVED));

    await act(() => result.current.finishAttempt(3, "Plan"));
    vi.mocked(client.saveAttemptAnswers).mockClear();
    act(() => result.current.setAnswer("q2", "Too late"));
    await tick();

    expect(client.saveAttemptAnswers).not.toHaveBeenCalled();
  });
  it("in the revise step, autosaves only the changed revision answers", async () => {
    const revising = buildSubmission({
      current_step: Step.REVISE,
      attempt_answers: { q1: "def f(): pass", q2: "first", q3: "1" },
      revision_answers: { q1: "def f(): pass", q2: "first", q3: "1" },
    });
    const client = fakeClient();
    const { result } = renderHook(() => useAnswers(client, revising));

    expect(result.current.answers.q2).toBe("first");
    act(() => result.current.setAnswer("q2", "second"));
    await tick();

    expect(client.saveRevisionAnswers).toHaveBeenCalledWith("sub-1", { q2: "second" }, undefined);
    expect(client.saveAttemptAnswers).not.toHaveBeenCalled();
  });

  it("switches to the revision after the evaluation, prefilled with the attempt", async () => {
    const feedback = buildSubmission({ current_step: Step.FEEDBACK, attempt_answers: { q1: "a", q2: "b", q3: "c" } });
    const revising = { ...feedback, current_step: Step.REVISE, revision_answers: { q1: "a", q2: "b", q3: "c" } };
    const client = fakeClient({ saveEvaluation: vi.fn().mockResolvedValue(revising) });
    const { result } = renderHook(() => useAnswers(client, feedback));

    await act(() => result.current.submitEvaluation("partly_correct", "  f(3) should be 2  "));

    expect(client.saveEvaluation).toHaveBeenCalledWith("sub-1", { verdict: "partly_correct", test_case: "f(3) should be 2" });
    expect(result.current.submission.current_step).toBe(Step.REVISE);
    expect(result.current.answers).toEqual({ q1: "a", q2: "b", q3: "c" });
    expect(result.current.saveStatus).toBe("saved");
  });

  it("saves the revision's changes before handing it in", async () => {
    const revising = buildSubmission({ current_step: Step.REVISE, revision_answers: { q1: "a", q2: "b", q3: "c" } });
    const calls: string[] = [];
    const client = fakeClient({
      saveRevisionAnswers: vi.fn().mockImplementation(async () => {
        calls.push("save");
        return revising;
      }),
      finishRevision: vi.fn().mockImplementation(async () => {
        calls.push("finish");
        return { ...revising, current_step: Step.EXPLAIN };
      }),
    });
    const { result } = renderHook(() => useAnswers(client, revising));

    act(() => result.current.setAnswer("q3", "d"));
    await act(() => result.current.finishRevision());

    expect(calls).toEqual(["save", "finish"]);
    expect(result.current.submission.current_step).toBe(Step.EXPLAIN);
  });

  it("stops autosaving once the revision is handed in", async () => {
    const explaining = buildSubmission({ current_step: Step.EXPLAIN, revision_answers: { q1: "a", q2: "b", q3: "c" } });
    const client = fakeClient();
    const { result } = renderHook(() => useAnswers(client, explaining));

    act(() => result.current.setAnswer("q1", "changed"));
    await tick();

    expect(client.saveRevisionAnswers).not.toHaveBeenCalled();
    expect(client.saveAttemptAnswers).not.toHaveBeenCalled();
  });
});
