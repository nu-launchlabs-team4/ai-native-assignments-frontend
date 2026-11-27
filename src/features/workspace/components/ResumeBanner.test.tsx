import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Step, SubmissionStatus } from "@/lib/constants";

import { buildSubmission } from "../testing";
import { isResuming, ResumeBanner } from "./ResumeBanner";

describe("isResuming", () => {
  it("is false for a fresh start", () => {
    expect(isResuming(buildSubmission(), 0)).toBe(false);
  });

  it("is true once an answer is written or the student is past step 1", () => {
    expect(isResuming(buildSubmission(), 1)).toBe(true);
    expect(isResuming(buildSubmission({ current_step: Step.EVALUATE }), 0)).toBe(true);
  });

  it("is false once the work is submitted", () => {
    const submitted = buildSubmission({ current_step: Step.EXPLAIN, status: SubmissionStatus.SUBMITTED });
    expect(isResuming(submitted, 3)).toBe(false);
  });
});

describe("ResumeBanner", () => {
  it("says the work is saved and which step the student is on, until dismissed", () => {
    const onDismiss = vi.fn();
    render(<ResumeBanner submission={buildSubmission({ current_step: Step.REVISE })} onDismiss={onDismiss} />);

    const banner = screen.getByRole("complementary", { name: /Welcome back/ });
    expect(banner.textContent).toContain("Your work is saved. You're on step 4 of 5: Revise.");

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(onDismiss).toHaveBeenCalled();
  });
});
