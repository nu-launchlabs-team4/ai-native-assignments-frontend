import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api";
import { Step } from "@/lib/constants";

import type { ActivityClient } from "./activity-client";
import { ACTIVITY_FLUSH_INTERVAL_MS, useActivityTracking } from "./use-activity-tracking";

function fakeClient(): ActivityClient {
  let next = 1;
  return {
    startSession: vi.fn(async (submissionId: string) => ({
      id: `w-${next++}`,
      submission_id: submissionId,
      started_at: "2026-11-26T00:00:00Z",
      ended_at: null,
    })),
    sendEvents: vi.fn().mockResolvedValue(undefined),
    endSession: vi.fn().mockResolvedValue(undefined),
  };
}

function setVisibility(state: DocumentVisibilityState) {
  Object.defineProperty(document, "visibilityState", { configurable: true, value: state });
  document.dispatchEvent(new Event("visibilitychange"));
}

async function track(client: ActivityClient, enabled = true) {
  const hook = renderHook((props: { questionId: string }) =>
    useActivityTracking({ client, submissionId: "s-1", step: Step.ATTEMPT, questionId: props.questionId, enabled }),
    { initialProps: { questionId: "q1" } },
  );
  // Let the session start.
  await act(async () => {});
  return hook;
}

async function flushInterval() {
  await act(async () => {
    vi.advanceTimersByTime(ACTIVITY_FLUSH_INTERVAL_MS);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  setVisibility("visible");
});

describe("useActivityTracking", () => {
  it("starts a session and sends pastes, with their size only, in the next batch", async () => {
    const client = fakeClient();
    const { result } = await track(client);
    expect(client.startSession).toHaveBeenCalledWith("s-1");

    act(() => result.current.recordPaste(120));
    await flushInterval();

    expect(client.sendEvents).toHaveBeenCalledWith(
      "w-1",
      [expect.objectContaining({ type: "paste", step: Step.ATTEMPT, question_id: "q1", detail: { characters: 120 } })],
      { keepalive: false },
    );
  });

  it("records the question that is open at the time", async () => {
    const client = fakeClient();
    const { result, rerender } = await track(client);

    rerender({ questionId: "q2" });
    act(() => result.current.recordPaste(5));
    await flushInterval();

    expect(vi.mocked(client.sendEvents).mock.calls[0][1][0]).toMatchObject({ question_id: "q2" });
  });

  it("records leaving and returning to the tab, sending at once on leaving", async () => {
    const client = fakeClient();
    await track(client);

    await act(async () => setVisibility("hidden"));
    expect(client.sendEvents).toHaveBeenCalledWith("w-1", [expect.objectContaining({ type: "tab_leave" })], {
      keepalive: true,
    });

    await act(async () => setVisibility("visible"));
    await flushInterval();
    expect(client.sendEvents).toHaveBeenLastCalledWith("w-1", [expect.objectContaining({ type: "tab_return" })], {
      keepalive: false,
    });
  });

  it("keeps events after a failed send and starts a new session when the old one is gone", async () => {
    const client = fakeClient();
    vi.mocked(client.sendEvents).mockRejectedValueOnce(new ApiError("ended", 409, "conflict", null));
    const { result } = await track(client);

    act(() => result.current.recordPaste(7));
    await flushInterval();
    await flushInterval();

    expect(client.startSession).toHaveBeenCalledTimes(2);
    expect(client.sendEvents).toHaveBeenLastCalledWith("w-2", [expect.objectContaining({ type: "paste" })], {
      keepalive: false,
    });
  });

  it("ends the session when the workspace closes", async () => {
    const client = fakeClient();
    const { unmount } = await track(client);

    unmount();
    await act(async () => {});

    expect(client.endSession).toHaveBeenCalledWith("w-1", { keepalive: false });
  });

  it("tracks nothing once the submission is submitted", async () => {
    const client = fakeClient();
    const { result } = await track(client, false);

    act(() => result.current.recordPaste(10));
    await flushInterval();

    expect(client.startSession).not.toHaveBeenCalled();
    expect(client.sendEvents).not.toHaveBeenCalled();
  });
});
