import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SubmittedSummary } from "./SubmittedSummary";

describe("SubmittedSummary", () => {
  it("shows what was handed in, with no fields to edit", () => {
    render(
      <SubmittedSummary
        submittedAt="2026-11-25T12:00:00Z"
        interviewAnswers={[{ question: "Why a loop?", answer: "Each letter needs a check." }]}
        aiDeclaration="Used only this app's AI tutor."
      />,
    );

    expect(screen.getByRole("status").textContent).toContain("Submitted on");
    expect(screen.getByText("1. Why a loop?")).toBeDefined();
    expect(screen.getByText("Each letter needs a check.")).toBeDefined();
    expect(screen.getByText("Used only this app's AI tutor.")).toBeDefined();
    expect(screen.queryByRole("textbox")).toBeNull();
  });
});
