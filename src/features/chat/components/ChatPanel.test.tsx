import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api";
import { ChatRole, ROUTES } from "@/lib/constants";

import { sendChatMessage } from "../api";
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

beforeAll(() => {
  // jsdom doesn't implement scrolling.
  Element.prototype.scrollIntoView = vi.fn();
});

beforeEach(() => {
  sendMock.mockReset();
  push.mockReset();
});

function renderUnlocked() {
  render(<ChatPanel submissionId="sub-1" attemptSaved />);
}

function typeAndSend(text: string) {
  fireEvent.change(screen.getByLabelText("Message the AI tutor"), { target: { value: text } });
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
}

describe("ChatPanel", () => {
  it("is locked until the attempt is saved", () => {
    render(<ChatPanel submissionId="sub-1" attemptSaved={false} />);

    expect(screen.getByText("AI tutor is locked")).toBeDefined();
    expect(screen.queryByLabelText("Message the AI tutor")).toBeNull();
  });

  it("is locked when there is no submission yet", () => {
    render(<ChatPanel submissionId={null} attemptSaved />);

    expect(screen.getByText("AI tutor is locked")).toBeDefined();
  });

  it("sends the message and shows the tutor's reply", async () => {
    sendMock.mockResolvedValue(REPLY);
    renderUnlocked();

    typeAndSend("Why is my output off by one?");

    expect(await screen.findByText(REPLY.content)).toBeDefined();
    expect(screen.getByText("Why is my output off by one?")).toBeDefined();
    expect(sendMock).toHaveBeenCalledWith("sub-1", "Why is my output off by one?");
  });

  it("shows the rate-limit message on 429 and keeps the draft", async () => {
    sendMock.mockRejectedValue(
      new ApiError("Too many requests. Please wait a moment and try again.", 429, "rate_limited", null),
    );
    renderUnlocked();

    typeAndSend("Help again");

    expect((await screen.findByRole("alert")).textContent).toContain("Too many requests");
    expect((screen.getByLabelText("Message the AI tutor") as HTMLTextAreaElement).value).toBe("Help again");
  });

  it("locks with the backend's message on 403", async () => {
    sendMock.mockRejectedValue(
      new ApiError("Chat is closed during the AI interview.", 403, "forbidden", null),
    );
    renderUnlocked();

    typeAndSend("Can you help?");

    expect(await screen.findByText("Chat is closed during the AI interview.")).toBeDefined();
    expect(screen.getByText("AI tutor is locked")).toBeDefined();
  });

  it("sends without crypto.randomUUID, which plain-http origins lack", async () => {
    vi.stubGlobal("crypto", {});
    sendMock.mockResolvedValue(REPLY);
    renderUnlocked();

    typeAndSend("First question");
    expect(await screen.findByText(REPLY.content)).toBeDefined();

    vi.unstubAllGlobals();
  });

  it("sends the student to login on 401", async () => {
    sendMock.mockRejectedValue(new ApiError("Your session has expired.", 401, "unauthorized", null));
    renderUnlocked();

    typeAndSend("Hello");

    await vi.waitFor(() => expect(push).toHaveBeenCalledWith(ROUTES.LOGIN));
  });
});
