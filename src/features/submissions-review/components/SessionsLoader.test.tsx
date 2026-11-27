import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import * as api from "@/lib/api";
import { Step } from "@/lib/constants";

import { mockEvent, mockSession } from "../mock-sessions";
import { ActivityEventType, type SubmissionSessions } from "../session-types";
import { SessionsLoader } from "./SessionsLoader";

// The sidebar menu button in the review layout reads the route.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/professor/submissions/s/sessions",
}));

const SUBMISSION_ID = "7d3c2a1e-0000-4000-8000-000000000001";

const REAL: SubmissionSessions = {
  submission_id: SUBMISSION_ID,
  assignment_title: "Week 5",
  student_name: "student@example.edu",
  sessions: [
    mockSession("w1", "2026-11-25T14:00:00Z", "2026-11-25T14:30:00Z", [
      mockEvent("a", ActivityEventType.SNAPSHOT, Step.ATTEMPT, "2026-11-25T14:05:00Z"),
      mockEvent("b", ActivityEventType.PASTE, Step.ATTEMPT, "2026-11-25T14:10:00Z", 120),
    ]),
  ],
};

describe("SessionsLoader", () => {
  afterEach(() => vi.restoreAllMocks());

  it("loads a real submission's sessions from the backend", async () => {
    const fetchSpy = vi.spyOn(api, "apiFetch").mockResolvedValue(REAL);
    render(<SessionsLoader submissionId={SUBMISSION_ID} />);

    expect(await screen.findByRole("heading", { level: 1, name: "student@example.edu" })).toBeDefined();
    expect(fetchSpy).toHaveBeenCalledWith(`/submissions/${SUBMISSION_ID}/sessions`);
    expect(screen.getByText("Work sessions · Week 5")).toBeDefined();
    expect(screen.getByText("Pasted 120 characters")).toBeDefined();
  });

  it("says when the submission isn't one of the professor's", async () => {
    vi.spyOn(api, "apiFetch").mockRejectedValue(new api.ApiError("Submission not found", 404, "not_found", null));
    render(<SessionsLoader submissionId={SUBMISSION_ID} />);

    expect(await screen.findByRole("heading", { level: 1, name: "Submission not found" })).toBeDefined();
  });

  it("shows the error and loads again on Try again", async () => {
    const fetchSpy = vi
      .spyOn(api, "apiFetch")
      .mockRejectedValueOnce(new api.ApiError("The server is busy.", 503, "unavailable", null))
      .mockResolvedValueOnce(REAL);
    render(<SessionsLoader submissionId={SUBMISSION_ID} />);

    expect((await screen.findByRole("alert")).textContent).toContain("The server is busy.");
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByRole("heading", { level: 1, name: "student@example.edu" })).toBeDefined();
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("opens the sample submissions without the backend", async () => {
    const fetchSpy = vi.spyOn(api, "apiFetch");
    render(<SessionsLoader submissionId="sub-1" />);

    expect(await screen.findByRole("heading", { level: 1, name: "Alex Rivera" })).toBeDefined();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
