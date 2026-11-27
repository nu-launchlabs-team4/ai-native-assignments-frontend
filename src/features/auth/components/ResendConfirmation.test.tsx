import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api";

import { resendConfirmation } from "../auth-client";
import { RESEND_COOLDOWN_SECONDS, ResendConfirmation } from "./ResendConfirmation";

vi.mock("../auth-client", () => ({ resendConfirmation: vi.fn() }));

const resendMock = vi.mocked(resendConfirmation);

beforeEach(() => {
  resendMock.mockReset().mockResolvedValue(undefined);
});

afterEach(() => {
  vi.useRealTimers();
});

async function clickSend() {
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Send the link again" }));
  });
}

describe("ResendConfirmation", () => {
  it("sends the link again, says so, and waits a minute before the next one", async () => {
    vi.useFakeTimers();
    render(<ResendConfirmation email="new@uni.edu" />);

    await clickSend();

    expect(resendMock).toHaveBeenCalledWith("new@uni.edu");
    expect(screen.getByRole("status").textContent).toBe("Sent to new@uni.edu. Check your inbox and spam folder.");
    const button = screen.getByRole("button", { name: `Send again in ${RESEND_COOLDOWN_SECONDS} s` });
    expect((button as HTMLButtonElement).disabled).toBe(true);

    act(() => {
      vi.advanceTimersByTime(RESEND_COOLDOWN_SECONDS * 1000);
    });

    expect((screen.getByRole("button", { name: "Send the link again" }) as HTMLButtonElement).disabled).toBe(false);
  });

  it("shows the backend's message when sending fails, such as too many emails", async () => {
    resendMock.mockRejectedValue(new ApiError("Too many attempts. Try again in a minute", 429, "rate_limited", null));
    render(<ResendConfirmation email="new@uni.edu" />);

    await clickSend();

    expect(screen.getByRole("alert").textContent).toBe("Too many attempts. Try again in a minute");
    expect((screen.getByRole("button", { name: "Send the link again" }) as HTMLButtonElement).disabled).toBe(false);
  });
});
