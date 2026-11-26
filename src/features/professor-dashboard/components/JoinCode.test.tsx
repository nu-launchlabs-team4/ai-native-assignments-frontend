import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { COPIED_MESSAGE_MS, JoinCode } from "./JoinCode";

const writeText = vi.fn<(text: string) => Promise<void>>();

beforeEach(() => {
  writeText.mockReset().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
});

afterEach(() => {
  vi.useRealTimers();
});

async function clickCopy() {
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Copy join code" }));
  });
}

describe("JoinCode", () => {
  it("shows the code and how many students joined", () => {
    render(<JoinCode code="7K4Q-M2XP" studentCount={3} />);

    expect(screen.getByText("7K4Q-M2XP")).toBeDefined();
    expect(screen.getByText("3 students joined")).toBeDefined();
  });

  it.each([
    [0, "No students yet"],
    [1, "1 student joined"],
  ])("says %i students as %s", (count, label) => {
    render(<JoinCode code="7K4Q-M2XP" studentCount={count} />);

    expect(screen.getByText(label)).toBeDefined();
  });

  it("copies the code and announces it, then clears the message", async () => {
    vi.useFakeTimers();
    render(<JoinCode code="7K4Q-M2XP" studentCount={0} />);

    await clickCopy();

    expect(writeText).toHaveBeenCalledWith("7K4Q-M2XP");
    expect(screen.getByRole("status").textContent).toBe("Copied");
    act(() => {
      vi.advanceTimersByTime(COPIED_MESSAGE_MS);
    });
    expect(screen.getByRole("status").textContent).toBe("");
  });

  it("explains how to copy by hand when the clipboard is blocked", async () => {
    writeText.mockRejectedValue(new Error("NotAllowedError"));
    render(<JoinCode code="7K4Q-M2XP" studentCount={0} />);

    await clickCopy();

    expect(screen.getByRole("status").textContent).toBe("Couldn't copy. Select the code and copy it.");
  });
});
