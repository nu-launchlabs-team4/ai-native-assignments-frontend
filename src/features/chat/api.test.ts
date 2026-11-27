import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiFetch } from "@/lib/api";
import { ChatRole } from "@/lib/constants";

import { loadChatHistory, sendChatMessage } from "./api";

vi.mock("@/lib/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api")>()),
  apiFetch: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(apiFetch).mockReset();
});

describe("sendChatMessage", () => {
  it("posts the message to the submission's chat and returns the reply as a tutor message", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ message_id: "m-1", reply: "What happens with uppercase letters?" });

    const reply = await sendChatMessage("sub 1", "Is my loop right?");

    expect(apiFetch).toHaveBeenCalledWith("/ai/submissions/sub%201/chat", {
      method: "POST",
      body: { message: "Is my loop right?" },
    });
    expect(reply).toMatchObject({ id: "m-1", role: ChatRole.ASSISTANT, content: "What happens with uppercase letters?" });
    expect(Number.isNaN(Date.parse(reply.created_at))).toBe(false);
  });
});

describe("loadChatHistory", () => {
  it("reads the submission's conversation and keeps who said what", async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      messages: [
        { id: "m-1", role: "student", content: "Is my loop right?", created_at: "2026-11-27T10:00:00Z" },
        { id: "m-2", role: "assistant", content: "What does it do first?", created_at: "2026-11-27T10:00:05Z" },
      ],
    });

    const history = await loadChatHistory("sub 1");

    expect(apiFetch).toHaveBeenCalledWith("/ai/submissions/sub%201/chat");
    expect(history.map((message) => [message.role, message.content])).toEqual([
      [ChatRole.STUDENT, "Is my loop right?"],
      [ChatRole.ASSISTANT, "What does it do first?"],
    ]);
  });
});
