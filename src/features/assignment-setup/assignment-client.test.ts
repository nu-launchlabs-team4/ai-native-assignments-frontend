import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError, apiFetch } from "@/lib/api";

import { apiAssignmentClient, assignmentClientFor, toUpdateBody } from "./assignment-client";
import { MOCK_DRAFT } from "./mock-draft";

vi.mock("@/lib/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api")>()),
  apiFetch: vi.fn(),
}));

const REAL = { ...MOCK_DRAFT, id: "a 1" };

describe("toUpdateBody", () => {
  it("sends only the editable fields, with questions in order and no ids", () => {
    const body = toUpdateBody(MOCK_DRAFT);

    expect(Object.keys(body)).toEqual(["title", "instructions", "ai_policy", "help_level", "final_check", "questions"]);
    expect(body.questions[0]).toEqual({
      prompt: MOCK_DRAFT.questions[0].prompt,
      answer_type: "code",
      language: "python",
      starter_code: MOCK_DRAFT.questions[0].starter_code,
    });
    expect(body.questions.map((question) => question.answer_type)).toEqual(["code", "text", "math"]);
  });
});

describe("apiAssignmentClient", () => {
  beforeEach(() => vi.mocked(apiFetch).mockReset());

  it("saves with PATCH /assignments/{id}", async () => {
    await apiAssignmentClient.save(REAL);

    expect(apiFetch).toHaveBeenCalledWith("/assignments/a%201", { method: "PATCH", body: toUpdateBody(REAL) });
  });

  it("publishes with POST /assignments/{id}/publish", async () => {
    await apiAssignmentClient.publish(REAL.id);

    expect(apiFetch).toHaveBeenCalledWith("/assignments/a%201/publish", { method: "POST" });
  });
});

describe("assignmentClientFor", () => {
  it("uses the backend for real assignments", () => {
    expect(assignmentClientFor(REAL)).toBe(apiAssignmentClient);
  });

  it("keeps the sample draft in the browser and refuses edits after publishing", async () => {
    const client = assignmentClientFor(MOCK_DRAFT);

    const published = await client.publish(MOCK_DRAFT.id);

    expect(published.published_at).not.toBeNull();
    expect(apiFetch).not.toHaveBeenCalled();
    await expect(client.save(MOCK_DRAFT)).rejects.toBeInstanceOf(ApiError);
    await expect(client.publish(MOCK_DRAFT.id)).rejects.toMatchObject({ status: 409 });
  });
});
