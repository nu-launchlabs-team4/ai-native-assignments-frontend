import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { EvaluationPanel } from "./EvaluationPanel";

function reasonField() {
  return screen.getByLabelText("Why? Give a test case or example that shows it");
}

describe("EvaluationPanel", () => {
  it("submits only once a verdict and a reason are given", () => {
    const onSubmit = vi.fn();
    render(<EvaluationPanel isSubmitting={false} submitError={null} onSubmit={onSubmit} />);
    const submit = screen.getByRole("button", { name: "Submit evaluation" });

    expect(submit).toHaveProperty("disabled", true);
    fireEvent.click(screen.getByRole("radio", { name: "No" }));
    expect(submit).toHaveProperty("disabled", true);
    fireEvent.change(reasonField(), { target: { value: "   " } });
    expect(submit).toHaveProperty("disabled", true);
    fireEvent.change(reasonField(), { target: { value: "f(0) returns 1, not 0." } });
    fireEvent.click(submit);

    expect(onSubmit).toHaveBeenCalledWith("incorrect", "f(0) returns 1, not 0.");
  });

  it("offers short answers to the question", () => {
    render(<EvaluationPanel isSubmitting={false} submitError={null} onSubmit={vi.fn()} />);

    const group = screen.getByRole("group", { name: "Was the tutor's feedback right?" });
    expect([...group.querySelectorAll("label")].map((label) => label.textContent)).toEqual([
      "Yes",
      "Partly",
      "No",
    ]);
  });

  it("shows why submitting failed", () => {
    render(<EvaluationPanel isSubmitting={false} submitError="Not allowed in the attempt step" onSubmit={vi.fn()} />);

    expect(screen.getByRole("alert").textContent).toBe("Not allowed in the attempt step");
  });
});
