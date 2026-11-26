import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError, apiFetch } from "./api";

vi.mock("@/lib/env", () => ({ env: { apiUrl: "http://backend.test" } }));

const fetchMock = vi.fn<typeof fetch>();

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function backendError(status: number, message: string): Response {
  return jsonResponse(status, { error: { code: "unauthorized", message, request_id: "r1" } });
}

function calledPaths(): string[] {
  return fetchMock.mock.calls.map(([url]) => String(url));
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("apiFetch session refresh", () => {
  it("refreshes once and retries when the session has run out", async () => {
    fetchMock
      .mockResolvedValueOnce(backendError(401, "Session expired"))
      .mockResolvedValueOnce(jsonResponse(200, { id: "u1" }))
      .mockResolvedValueOnce(jsonResponse(200, { ok: true }));

    await expect(apiFetch("/submissions/1")).resolves.toEqual({ ok: true });
    expect(calledPaths()).toEqual(["/api/submissions/1", "/api/auth/refresh", "/api/submissions/1"]);
  });

  it("shares one refresh between calls that fail together", async () => {
    fetchMock.mockImplementation(async (url) => {
      const path = String(url);
      if (path === "/api/auth/refresh") return jsonResponse(200, {});
      const refreshed = calledPaths().includes("/api/auth/refresh");
      return refreshed ? jsonResponse(200, { path }) : backendError(401, "Session expired");
    });

    await Promise.all([apiFetch("/a"), apiFetch("/b")]);

    expect(calledPaths().filter((path) => path === "/api/auth/refresh")).toHaveLength(1);
  });

  it("asks to sign in again when the refresh fails too", async () => {
    fetchMock
      .mockResolvedValueOnce(backendError(401, "Session expired"))
      .mockResolvedValueOnce(backendError(401, "Session expired. Log in again"));

    const error = await apiFetch("/submissions/1").catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(401);
    expect((error as ApiError).message).toBe("Your session has expired. Please sign in again.");
    expect(calledPaths()).toHaveLength(2);
  });

  it("shows the backend's message for a failed log-in, without refreshing", async () => {
    fetchMock.mockResolvedValueOnce(backendError(401, "Wrong email or password"));

    const error = await apiFetch("/auth/login", { method: "POST", body: {} }).catch((caught: unknown) => caught);

    expect((error as ApiError).message).toBe("Wrong email or password");
    expect(calledPaths()).toEqual(["/api/auth/login"]);
  });
});
