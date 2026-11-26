import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiFetch } from "@/lib/api";

import { apiActivityClient } from "./activity-client";
import { MOCK_ASSIGNMENT_ID } from "./mock-assignment";
import { activityClientFor, createMockActivityClient } from "./mock-activity-client";

vi.mock("@/lib/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api")>()),
  apiFetch: vi.fn().mockResolvedValue({}),
}));

beforeEach(() => {
  vi.mocked(apiFetch).mockClear();
});

const PASTE = {
  type: "paste" as const,
  step: "attempt" as const,
  question_id: "q1",
  occurred_at: "2026-11-26T00:00:00Z",
  detail: { characters: 42 },
};

describe("apiActivityClient", () => {
  it("starts a session with POST /submissions/{id}/sessions", async () => {
    await apiActivityClient.startSession("s-1");

    expect(apiFetch).toHaveBeenCalledWith("/submissions/s-1/sessions", { method: "POST" });
  });

  it("sends events with POST /sessions/{id}/events and passes keepalive through", async () => {
    await apiActivityClient.sendEvents("w-1", [PASTE], { keepalive: true });

    expect(apiFetch).toHaveBeenCalledWith("/sessions/w-1/events", {
      method: "POST",
      body: { events: [PASTE] },
      keepalive: true,
    });
  });

  it("ends a session with POST /sessions/{id}/end", async () => {
    await apiActivityClient.endSession("w-1");

    expect(apiFetch).toHaveBeenCalledWith("/sessions/w-1/end", { method: "POST", keepalive: undefined });
  });
});

describe("mock activity client", () => {
  it("records events in the open session", async () => {
    const client = createMockActivityClient();
    const session = await client.startSession("s-1");
    await client.sendEvents(session.id, [PASTE]);

    expect(client.sessions.get(session.id)?.events).toEqual([PASTE]);
  });

  it("ends the open session when a new one starts, and refuses events for it", async () => {
    const client = createMockActivityClient();
    const first = await client.startSession("s-1");
    await client.startSession("s-1");

    expect(client.sessions.get(first.id)?.endedAt).not.toBeNull();
    await expect(client.sendEvents(first.id, [PASTE])).rejects.toThrow("ended");
  });

  it("is used for the sample assignment only", () => {
    expect(activityClientFor(MOCK_ASSIGNMENT_ID)).not.toBe(apiActivityClient);
    expect(activityClientFor("a-real-id")).toBe(apiActivityClient);
  });
});
