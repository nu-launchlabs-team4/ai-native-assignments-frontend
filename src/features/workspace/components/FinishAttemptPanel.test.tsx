import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FinishAttemptPanel } from "./FinishAttemptPanel";

const BASE = {
  answeredCount: 3,
  questionCount: 3,
  saveStatus: "saved" as const,
  lastSavedAt: null,
  isFinishing: false,
  finishError: null,
};

function submitButton() {
  return screen.getByRole("button", { name: "Submit attempt" }) as HTMLButtonElement;
}

function fillIn() {
  fireEvent.click(screen.getByRole("radio", { name: "4" }));
  fireEvent.change(screen.getByLabelText("How did you approach it?"), {
    target: { value: "Loop over each letter." },
  });
}

describe("FinishAttemptPanel", () => {
  it("keeps Submit disabled until confidence and the approach note are filled", () => {
    render(<FinishAttemptPanel {...BASE} onFinish={vi.fn()} />);
    expect(submitButton().disabled).toBe(true);

    fireEvent.click(screen.getByRole("radio", { name: "4" }));
    expect(submitButton().disabled).toBe(true);

    fireEvent.change(screen.getByLabelText("How did you approach it?"), { target: { value: "   " } });
    expect(submitButton().disabled).toBe(true);

    fillIn();
    expect(submitButton().disabled).toBe(false);
  });

  it("keeps Submit disabled until every question is answered", () => {
    render(<FinishAttemptPanel {...BASE} answeredCount={2} onFinish={vi.fn()} />);
    fillIn();

    expect(submitButton().disabled).toBe(true);
    expect(screen.getByText("2 of 3 answered")).toBeDefined();
  });

  it("submits the confidence and note", () => {
    const onFinish = vi.fn();
    render(<FinishAttemptPanel {...BASE} onFinish={onFinish} />);
    fillIn();

    fireEvent.click(submitButton());

    expect(onFinish).toHaveBeenCalledWith(4, "Loop over each letter.");
  });

  it("offers confidence as five radio buttons in one group", () => {
    render(<FinishAttemptPanel {...BASE} onFinish={vi.fn()} />);

    expect(screen.getByRole("group", { name: "How confident are you?" })).toBeDefined();
    expect(screen.getAllByRole("radio")).toHaveLength(5);
  });

  it("shows the error and the save status", () => {
    render(
      <FinishAttemptPanel {...BASE} saveStatus="error" finishError="Answer every question" onFinish={vi.fn()} />,
    );

    expect(screen.getByRole("alert").textContent).toBe("Answer every question");
    expect(screen.getByText("Couldn't save. Retrying…")).toBeDefined();
  });

});
