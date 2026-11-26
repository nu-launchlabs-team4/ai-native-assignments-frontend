import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FinishRevisionPanel } from "./FinishRevisionPanel";

const BASE = {
  questionCount: 3,
  saveStatus: "saved" as const,
  lastSavedAt: null,
  isSubmitting: false,
  submitError: null,
};

describe("FinishRevisionPanel", () => {
  it("waits until every question is answered", () => {
    render(<FinishRevisionPanel {...BASE} answeredCount={2} onFinish={vi.fn()} />);

    expect(screen.getByText("2 of 3 answered")).toBeDefined();
    expect(screen.getByRole("button", { name: "Submit revision" })).toHaveProperty("disabled", true);
    expect(screen.getByText("Answer every question to submit.")).toBeDefined();
  });

  it("hands in the revision", () => {
    const onFinish = vi.fn();
    render(<FinishRevisionPanel {...BASE} answeredCount={3} onFinish={onFinish} />);

    fireEvent.click(screen.getByRole("button", { name: "Submit revision" }));

    expect(onFinish).toHaveBeenCalled();
    expect(screen.getByRole("status").textContent).toBe("All changes saved");
  });
});
