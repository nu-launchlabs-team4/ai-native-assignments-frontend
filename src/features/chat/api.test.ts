import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiFetch } from "@/lib/api";
import { ChatRole } from "@/lib/constants";

import { sendChatMessage } from "./api";

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
