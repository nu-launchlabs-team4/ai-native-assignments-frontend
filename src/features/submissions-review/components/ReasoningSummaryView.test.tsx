import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { submissionTrailRoute } from "@/lib/constants";

import { getMockSubmission } from "../mock-submissions";
import { ReasoningSummaryView } from "./ReasoningSummaryView";

function renderSubmission(id: string) {
  const submission = getMockSubmission(id);
  if (!submission) {
    throw new Error(`No mock submission ${id}`);
  }
  render(
    <ReasoningSummaryView submissionId={submission.id} studentName={submission.student_name} summary={submission.summary} />,
  );
}

describe("ReasoningSummaryView", () => {
  it("shows the review priority with every reason", () => {
    renderSubmission("sub-2");

    const priority = screen.getByRole("region", { name: /Review priority/ });
    expect(priority.textContent).toContain("Needs a conversation");
    const reasons = within(screen.getByRole("list", { name: "Reasons for this priority" })).getAllByRole("listitem");
    expect(reasons).toHaveLength(3);
    expect(reasons[0].textContent).toBe("The interview answers do not match the revised code.");
  });

  it("shows each part of the summary", () => {
    renderSubmission("sub-2");

    ["Initial approach", "Main misconception", "AI suggestions", "Revision change", "Test cases used", "Interview answers", "AI declaration"].forEach(
      (term) => expect(screen.getByText(term)).toBeDefined(),
    );
    expect(screen.getByText("Confidence before the AI unlocked: 5 of 5")).toBeDefined();
    expect(screen.getByText("Rejected")).toBeDefined();
  });

  it("says when there is no misconception or test case", () => {
    renderSubmission("sub-1");
    expect(screen.getByText("None identified")).toBeDefined();

    renderSubmission("sub-2");
    expect(screen.getByText("None")).toBeDefined();
  });

  it("explains that the summary comes after submission", () => {
    renderSubmission("sub-3");

    expect(screen.getByText("The summary appears after Jordan Lee submits the assignment.")).toBeDefined();
    expect(screen.queryByRole("region", { name: /Review priority/ })).toBeNull();
  });

  it("links to the full trail", () => {
    renderSubmission("sub-1");

    const link = screen.getByRole("link", { name: "Open the full trail" });
    expect(link.getAttribute("href")).toBe(submissionTrailRoute("sub-1"));
  });
});
