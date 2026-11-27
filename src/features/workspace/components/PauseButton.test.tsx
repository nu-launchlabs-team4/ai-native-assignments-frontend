import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PauseButton } from "./PauseButton";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

beforeEach(() => {
  push.mockReset();
});

async function clickPause() {
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Save and pause" }));
  });
}

describe("PauseButton", () => {
  it("saves, then goes back to the assignment list", async () => {
    const onSave = vi.fn().mockResolvedValue(true);
    render(<PauseButton onSave={onSave} />);

    await clickPause();

    expect(onSave).toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith("/student");
  });

  it("stays and says so when the save fails", async () => {
    render(<PauseButton onSave={vi.fn().mockResolvedValue(false)} />);

    await clickPause();

    expect(push).not.toHaveBeenCalled();
    expect(screen.getByRole("alert").textContent).toContain("Couldn't save, so you're still here.");
    expect((screen.getByRole("button", { name: "Save and pause" }) as HTMLButtonElement).disabled).toBe(false);
  });
});
