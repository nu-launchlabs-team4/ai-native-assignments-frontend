import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { submissionSummaryRoute } from "@/lib/constants";

import { getMockSubmissions, MOCK_REVIEW_ASSIGNMENT_ID } from "../mock-submissions";
import { SubmissionsTable } from "./SubmissionsTable";

const SUBMISSIONS = getMockSubmissions(MOCK_REVIEW_ASSIGNMENT_ID)?.submissions ?? [];

function bodyRows() {
  // The first row is the header.
  return screen.getAllByRole("row").slice(1);
}

describe("SubmissionsTable", () => {
  it("lists the submission that needs a conversation first", () => {
    render(<SubmissionsTable submissions={SUBMISSIONS} />);

    const rows = bodyRows();
    expect(rows).toHaveLength(3);
    expect(within(rows[0]).getByRole("rowheader").textContent).toBe("Sam Patel");
    expect(rows[0].textContent).toContain("Needs a conversation");
  });

  it("explains that an in-progress submission has no priority yet", () => {
    render(<SubmissionsTable submissions={SUBMISSIONS} />);

    const inProgress = bodyRows()[2];
    expect(inProgress.textContent).toContain("In progress");
    expect(inProgress.textContent).toContain("Not yet");
    expect(inProgress.textContent).toContain("After submission");
  });

  it("links each row to that student's summary", () => {
    render(<SubmissionsTable submissions={SUBMISSIONS} />);

    const link = screen.getByRole("link", { name: "View summary for Alex Rivera" });
    expect(link.getAttribute("href")).toBe(submissionSummaryRoute("sub-1"));
  });

  it("shows an empty state when nobody has started", () => {
    render(<SubmissionsTable submissions={[]} />);

    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.getByText(/No submissions yet/)).toBeDefined();
  });
});
