import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { getMockSessions } from "../mock-sessions";
import { SessionTimeline } from "./SessionTimeline";

function renderSessions(submissionId: string) {
  render(<SessionTimeline sessions={getMockSessions(submissionId)?.sessions ?? []} />);
}

describe("SessionTimeline", () => {
  it("shows the total time in each step, including steps not reached", () => {
    renderSessions("sub-3");

    const table = screen.getByRole("table", { name: "Time per step" });
    expect(within(table).getByRole("row", { name: "Attempt 12 min" })).toBeDefined();
    expect(within(table).getByRole("row", { name: "Explain Not reached" })).toBeDefined();
    expect(within(table).getByRole("row", { name: "Total 12 min" })).toBeDefined();
  });

  it("lists each session with its steps, and says when one is still open", () => {
    renderSessions("sub-1");

    const sessions = within(screen.getByRole("list", { name: "Sessions, oldest first" })).getAllByRole("article");
    expect(sessions.map((session) => within(session).getByRole("heading").textContent)).toEqual([
      "Session 1",
      "Session 2",
    ]);
    const steps = within(screen.getByRole("list", { name: "Steps in session 1" })).getAllByRole("listitem");
    expect(steps.map((step) => step.textContent)).toEqual(["Attempt 25 min", "Feedback 15 min"]);
  });

  it("marks pastes and time away from the tab, and counts snapshots", () => {
    renderSessions("sub-2");

    const events = within(screen.getByRole("list", { name: "Marked events in session 1" })).getAllByRole("listitem");
    expect(events.map((event) => event.textContent)).toEqual([
      "1:31 AM UTCAttempt stepAway from the tab for 2 min",
      "1:33 AM UTCAttempt stepPasted 610 characters",
      "1:50 AM UTCRevise stepAway from the tab for 8 min",
    ]);
    expect(screen.getByText("4 snapshots of the answers saved")).toBeDefined();
  });

  it("says when a session is still open", () => {
    renderSessions("sub-3");

    expect(screen.getByText(/Still open, 12 min so far/)).toBeDefined();
  });

  it("shows an empty state before the student has started", () => {
    renderSessions("unknown");

    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.getByText(/No work sessions yet/)).toBeDefined();
  });
});
