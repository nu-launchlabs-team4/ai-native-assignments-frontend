import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api";
import { ChatRole, ROUTES } from "@/lib/constants";

import { sendChatMessage } from "../api";
import type { ChatMessage } from "../types";
import { ChatPanel } from "./ChatPanel";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("../api", () => ({ sendChatMessage: vi.fn() }));

const sendMock = vi.mocked(sendChatMessage);

const REPLY = {
  id: "reply-1",
  role: ChatRole.ASSISTANT,
  content: "What does your loop do on the last index?",
  created_at: "2026-11-20T00:00:00Z",
};

beforeEach(() => {
  sendMock.mockReset();
  push.mockReset();
});

const noHistory = () => Promise.resolve([]);

async function renderUnlocked(loadHistory: () => Promise<ChatMessage[]> = noHistory) {
  render(<ChatPanel submissionId="sub-1" attemptSaved loadHistory={loadHistory} />);
  // Let the conversation load.
  await act(async () => {});
}

function typeAndSend(text: string) {
  fireEvent.change(screen.getByLabelText("Message the AI tutor"), { target: { value: text } });
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
}

describe("ChatPanel", () => {
  it("is locked until the attempt is saved", () => {
    render(<ChatPanel submissionId="sub-1" attemptSaved={false} loadHistory={noHistory} />);

    expect(screen.getByText("AI tutor is locked")).toBeDefined();
    expect(screen.queryByLabelText("Message the AI tutor")).toBeNull();
  });

  it("is locked when there is no submission yet", () => {
    render(<ChatPanel submissionId={null} attemptSaved loadHistory={noHistory} />);

    expect(screen.getByText("AI tutor is locked")).toBeDefined();
  });

  it("sends the message and shows the tutor's reply", async () => {
    sendMock.mockResolvedValue(REPLY);
    await renderUnlocked();

    typeAndSend("Why is my output off by one?");

    expect(await screen.findByText(REPLY.content)).toBeDefined();
    expect(screen.getByText("Why is my output off by one?")).toBeDefined();
    expect(sendMock).toHaveBeenCalledWith("sub-1", "Why is my output off by one?");
  });

  it("shows the rate-limit message on 429 and keeps the draft", async () => {
    sendMock.mockRejectedValue(
      new ApiError("Too many requests. Please wait a moment and try again.", 429, "rate_limited", null),
    );
    await renderUnlocked();

    typeAndSend("Help again");

    expect((await screen.findByRole("alert")).textContent).toContain("Too many requests");
    expect((screen.getByLabelText("Message the AI tutor") as HTMLTextAreaElement).value).toBe("Help again");
  });

  it("locks with the backend's message on 403", async () => {
    sendMock.mockRejectedValue(
      new ApiError("Chat is closed during the AI interview.", 403, "forbidden", null),
    );
    await renderUnlocked();

    typeAndSend("Can you help?");

    expect(await screen.findByText("Chat is closed during the AI interview.")).toBeDefined();
    expect(screen.getByText("AI tutor is locked")).toBeDefined();
  });

  it("sends without crypto.randomUUID, which plain-http origins lack", async () => {
    vi.stubGlobal("crypto", {});
    sendMock.mockResolvedValue(REPLY);
    await renderUnlocked();

    typeAndSend("First question");
    expect(await screen.findByText(REPLY.content)).toBeDefined();

    vi.unstubAllGlobals();
  });

  it("sends the student to login on 401", async () => {
    sendMock.mockRejectedValue(new ApiError("Your session has expired.", 401, "unauthorized", null));
    await renderUnlocked();

    typeAndSend("Hello");

    await vi.waitFor(() => expect(push).toHaveBeenCalledWith(ROUTES.LOGIN));
  });

  it("shows the conversation so far when it opens", async () => {
    const question = { ...REPLY, id: "m-1", role: ChatRole.STUDENT, content: "Is my loop right?" };
    await renderUnlocked(() => Promise.resolve([question, REPLY]));

    expect(screen.getByText("Is my loop right?")).toBeDefined();
    expect(screen.getByText(REPLY.content)).toBeDefined();
    expect(screen.queryByText("Loading your conversation…")).toBeNull();
  });

  it("offers to try again when the conversation can't load", async () => {
    const loadHistory = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce([REPLY]);
    await renderUnlocked(loadHistory);

    expect(screen.getByRole("alert").textContent).toBe("Couldn't load your conversation.");

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    });

    expect(loadHistory).toHaveBeenCalledTimes(2);
    expect(screen.getByText(REPLY.content)).toBeDefined();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("doesn't load the conversation while the tutor is locked", () => {
    const loadHistory = vi.fn().mockResolvedValue([]);
    render(<ChatPanel submissionId="sub-1" attemptSaved={false} loadHistory={loadHistory} />);

    expect(loadHistory).not.toHaveBeenCalled();
  });
});
