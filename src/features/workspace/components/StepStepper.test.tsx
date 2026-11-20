import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Step } from "@/lib/constants";

import { StepStepper } from "./StepStepper";

describe("StepStepper", () => {
  it("shows the five steps in order", () => {
    render(<StepStepper currentStep={Step.ATTEMPT} />);

    const steps = within(screen.getByRole("navigation", { name: "Assignment steps" })).getAllByRole(
      "listitem",
    );
    const labels = steps.map((step) => step.textContent?.replace(/\(.*\)/, "").replace(/\d/g, "").trim());
    expect(labels).toEqual(["Attempt", "Feedback", "Evaluate", "Revise", "Explain"]);
  });

  it("marks exactly one step as current", () => {
    render(<StepStepper currentStep={Step.EVALUATE} />);

    const current = screen.getAllByRole("listitem").filter((step) => step.getAttribute("aria-current") === "step");
    expect(current).toHaveLength(1);
    expect(current[0].textContent).toContain("Evaluate");
  });

  it("tells screen readers which steps are done", () => {
    render(<StepStepper currentStep={Step.EVALUATE} />);

    const [attempt, feedback, , revise] = screen.getAllByRole("listitem");
    expect(attempt.textContent).toContain("completed");
    expect(feedback.textContent).toContain("completed");
    expect(revise.textContent).toContain("not started");
  });
});
