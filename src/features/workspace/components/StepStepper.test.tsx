import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Step } from "@/lib/constants";

import { StepStepper } from "./StepStepper";

function steps() {
  return within(screen.getByRole("navigation", { name: "Assignment steps" })).getAllByRole("listitem");
}

describe("StepStepper", () => {
  it("shows the five steps in order", () => {
    render(<StepStepper currentStep={Step.ATTEMPT} />);

    const items = steps();
    expect(items).toHaveLength(5);
    ["Attempt", "Feedback", "Evaluate", "Revise", "Explain"].forEach((label, index) => {
      expect(items[index].textContent).toContain(label);
    });
  });

  it("marks exactly one step as current", () => {
    render(<StepStepper currentStep={Step.EVALUATE} />);

    const current = steps().filter((step) => step.getAttribute("aria-current") === "step");
    expect(current).toHaveLength(1);
    expect(current[0].textContent).toContain("Evaluate");
  });

  it("tells screen readers which steps are done and which are not started", () => {
    render(<StepStepper currentStep={Step.EVALUATE} />);

    const [attempt, feedback, , revise] = steps();
    expect(attempt.textContent).toContain("completed");
    expect(feedback.textContent).toContain("completed");
    expect(revise.textContent).toContain("not started");
  });
});
