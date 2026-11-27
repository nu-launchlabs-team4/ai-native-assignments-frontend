import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api";
import type { StudentAssignmentOut } from "@/lib/api-types";
import { Step, SubmissionStatus } from "@/lib/constants";

import { joinCourse, loadStudentAssignments } from "../student-client";
import { StudentHome } from "./StudentHome";

vi.mock("../student-client", () => ({ loadStudentAssignments: vi.fn(), joinCourse: vi.fn() }));

const loadMock = vi.mocked(loadStudentAssignments);
const joinMock = vi.mocked(joinCourse);

const NOT_STARTED: StudentAssignmentOut = {
  id: "a2",
  title: "Week 4: Lists",
  course_id: "c1",
  course_title: "Intro to Programming",
  published_at: "2026-11-25T00:00:00Z",
  submission_id: null,
  status: null,
  current_step: null,
};
const IN_PROGRESS: StudentAssignmentOut = {
  ...NOT_STARTED,
  id: "a1",
  title: "Week 3: Counting and loops",
  submission_id: "s1",
  status: SubmissionStatus.IN_PROGRESS,
  current_step: Step.FEEDBACK,
};

beforeEach(() => {
  loadMock.mockReset();
  joinMock.mockReset();
});

async function renderHome() {
  render(<StudentHome />);
  await act(async () => {});
}

function typeCodeAndJoin(code: string) {
  fireEvent.change(screen.getByLabelText("Join a course"), { target: { value: code } });
  fireEvent.click(screen.getByRole("button", { name: "Join" }));
}

describe("StudentHome", () => {
  it("shows a loading state first", () => {
    loadMock.mockReturnValue(new Promise(() => {}));
    render(<StudentHome />);

    expect(screen.getByText("Loading your assignments…").getAttribute("role")).toBe("status");
  });

  it("lists each assignment with its course and progress, linking to the workspace", async () => {
    loadMock.mockResolvedValue([NOT_STARTED, IN_PROGRESS]);
    await renderHome();

    const rows = within(screen.getByRole("list", { name: "Your assignments" })).getAllByRole("listitem");
    expect(rows[0].textContent).toContain("Intro to Programming");
    expect(rows[0].textContent).toContain("Not started");
    expect(rows[1].textContent).toContain("Step 2 of 5: Feedback");
    expect(within(rows[1]).getByRole("link", { name: "Week 3: Counting and loops" }).getAttribute("href")).toBe(
      "/student/assignments/a1",
    );
  });

  it("invites the student to join a course, with the sample to try meanwhile", async () => {
    loadMock.mockResolvedValue([]);
    await renderHome();

    expect(screen.getByText("Join a course with the code from your professor.")).toBeDefined();
    expect(screen.getByRole("link", { name: "Try the sample assignment" }).getAttribute("href")).toBe(
      "/student/assignments/sample-1",
    );
  });

  it("joins with the code, then shows the course's assignments", async () => {
    loadMock.mockResolvedValueOnce([]).mockResolvedValueOnce([NOT_STARTED]);
    joinMock.mockResolvedValue({ course_id: "c1", course_title: "Intro to Programming", joined_at: "2026-11-27T00:00:00Z" });
    await renderHome();

    await act(async () => typeCodeAndJoin(" 7k4q-m2xp "));

    expect(joinMock).toHaveBeenCalledWith("7k4q-m2xp");
    expect(screen.getByText("Joined Intro to Programming. Its assignments are below.")).toBeDefined();
    expect(screen.getByRole("link", { name: "Week 4: Lists" })).toBeDefined();
    expect((screen.getByLabelText("Join a course") as HTMLInputElement).value).toBe("");
  });

  it("shows an unknown code's message under the field", async () => {
    loadMock.mockResolvedValue([]);
    joinMock.mockRejectedValue(
      new ApiError("No course has that code. Check it with your professor.", 404, "not_found", null),
    );
    await renderHome();

    await act(async () => typeCodeAndJoin("ZZZZ-ZZZZ"));

    const field = screen.getByLabelText("Join a course");
    expect(field.getAttribute("aria-invalid")).toBe("true");
    const error = document.getElementById(field.getAttribute("aria-describedby") ?? "");
    expect(error?.textContent).toBe("No course has that code. Check it with your professor.");
  });

  it("asks for a code before sending an empty one", async () => {
    loadMock.mockResolvedValue([]);
    await renderHome();

    await act(async () => typeCodeAndJoin("  "));

    expect(joinMock).not.toHaveBeenCalled();
    expect(screen.getByRole("alert").textContent).toBe("Enter the code from your professor, such as 7K4Q-M2XP.");
  });

  it("offers to try again when the list can't load", async () => {
    loadMock.mockRejectedValueOnce(new ApiError("Can't reach the server.", 0, "network_error", null));
    loadMock.mockResolvedValueOnce([IN_PROGRESS]);
    await renderHome();

    expect(screen.getByRole("alert").textContent).toContain("Can't reach the server.");
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    });

    expect(screen.getByRole("link", { name: "Week 3: Counting and loops" })).toBeDefined();
  });
});
