import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { JoinCode } from "./JoinCode";

function mockClipboard(writeText: (text: string) => Promise<void>) {
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
}

describe("JoinCode", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("copies the code and says so, then resets", async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    mockClipboard(writeText);
    render(<JoinCode code="7K4Q-M2XP" courseTitle="Intro to Programming" />);

    expect(screen.getByText("7K4Q-M2XP")).toBeDefined();
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy join code for Intro to Programming" }));
    });

    expect(writeText).toHaveBeenCalledWith("7K4Q-M2XP");
    expect(screen.getByRole("button").textContent).toBe("Copied");
    expect(screen.getByRole("status").textContent).toBe("Join code copied.");

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByRole("button").textContent).toBe("Copy");
  });

  it("asks the professor to copy it by hand when the clipboard is blocked", async () => {
    mockClipboard(vi.fn().mockRejectedValue(new Error("denied")));
    render(<JoinCode code="7K4Q-M2XP" courseTitle="Intro to Programming" />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Copy join code/ }));
    });

    expect(screen.getByRole("status").textContent).toBe("Couldn't copy. Select the code and copy it yourself.");
  });
});
