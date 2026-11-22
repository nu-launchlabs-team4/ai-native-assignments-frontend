import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { getMockTrail } from "../mock-trail";
import { TrailTimeline } from "./TrailTimeline";

function renderTrail(submissionId: string) {
  render(<TrailTimeline entries={getMockTrail(submissionId)?.entries ?? []} />);
}

function entryHeadings() {
  const items = within(screen.getByRole("list", { name: "Trail, oldest first" })).getAllByRole("listitem");
  return items.map((item) => within(item).getByRole("heading").textContent);
}

describe("TrailTimeline", () => {
  it("shows attempt, chat, evaluation, revision, interview and declaration in order", () => {
    renderTrail("sub-1");

    expect(entryHeadings()).toEqual([
      "First attempt",
      "Student asked the AI tutor",
      "AI tutor replied",
      "Judged the AI's feedback as partly correct",
      "Revised the attempt",
      "Interview: Why did you lowercase the text first?",
      "Interview: Which AI suggestion did you use, and why?",
      "Interview: What would break if the input had accented vowels?",
      "Declared what the AI contributed",
    ]);
  });

  it("shows the step and the student's confidence and test case", () => {
    renderTrail("sub-1");

    const attempt = screen.getByRole("article", { name: "First attempt" });
    expect(attempt.textContent).toContain("Attempt step");
    expect(attempt.textContent).toContain("Confidence before the AI unlocked: 4 of 5");
    const evaluation = screen.getByRole("article", { name: /Judged the AI's feedback/ });
    expect(evaluation.textContent).toContain('count_vowels("") == 0');
  });

  it("marks what the revision added and removed", () => {
    renderTrail("sub-2");

    const revision = screen.getByRole("article", { name: "Revised the attempt" });
    const removed = within(revision).getAllByRole("deletion").map((line) => line.textContent);
    const added = within(revision).getAllByRole("insertion").map((line) => line.textContent);
    expect(removed).toContain("-     for ch in text:");
    expect(added).toContain("+     for ch in text.lower():");
  });

  it("shows an empty state before any work is saved", () => {
    renderTrail("sub-3");

    expect(screen.queryByRole("list")).toBeNull();
    expect(screen.getByText(/No work saved yet/)).toBeDefined();
  });
});
