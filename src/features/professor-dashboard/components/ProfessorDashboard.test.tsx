import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MOCK_DRAFT } from "@/features/assignment-setup/mock-draft";
import { ApiError } from "@/lib/api";

import { createCourse, type DashboardCourse, loadCourses } from "../dashboard-client";
import { ProfessorDashboard } from "./ProfessorDashboard";

vi.mock("../dashboard-client", () => ({ loadCourses: vi.fn(), createCourse: vi.fn() }));

const COURSE: DashboardCourse = {
  id: "c1",
  title: "Intro to Programming",
  created_at: "2026-11-20T00:00:00Z",
  assignments: [
    { ...MOCK_DRAFT, id: "a1", title: "Week 3 draft", published_at: null, created_at: "2026-11-21T10:00:00Z" },
    { ...MOCK_DRAFT, id: "a2", title: "Week 2", published_at: "2026-11-18T10:00:00Z" },
  ],
};

describe("ProfessorDashboard", () => {
  beforeEach(() => {
    vi.mocked(loadCourses).mockReset();
    vi.mocked(createCourse).mockReset();
  });

  it("shows a loading state first", () => {
    vi.mocked(loadCourses).mockReturnValue(new Promise(() => {}));
    render(<ProfessorDashboard />);

    expect(screen.getByRole("status").textContent).toBe("Loading your courses…");
  });

  it("lists courses with each assignment's state, date and link", async () => {
    vi.mocked(loadCourses).mockResolvedValue([COURSE]);
    render(<ProfessorDashboard />);

    const course = await screen.findByRole("region", { name: "Intro to Programming" });
    const rows = within(course).getAllByRole("listitem");
    expect(rows[0].textContent).toContain("Draft");
    expect(rows[0].textContent).toContain("Created Nov 21, 2026");
    expect(within(rows[0]).getByRole("link", { name: "Week 3 draft" }).getAttribute("href")).toBe("/professor/assignments/a1");
    expect(rows[1].textContent).toContain("Published Nov 18, 2026");
    expect(within(rows[1]).getByRole("link", { name: "Week 2" }).getAttribute("href")).toBe(
      "/professor/assignments/a2/submissions",
    );
    expect(within(course).getByRole("link", { name: "New assignment" }).getAttribute("href")).toBe(
      "/professor/assignments/new?course=c1",
    );
  });

  it("explains what to do when there are no courses", async () => {
    vi.mocked(loadCourses).mockResolvedValue([]);
    render(<ProfessorDashboard />);

    expect(await screen.findByText(/You have no courses yet/)).toBeDefined();
  });

  it("says when a course has no assignments", async () => {
    vi.mocked(loadCourses).mockResolvedValue([{ ...COURSE, assignments: [] }]);
    render(<ProfessorDashboard />);

    expect(await screen.findByText("No assignments yet. Upload a PDF to start one.")).toBeDefined();
  });

  it("shows the error and loads again on Try again", async () => {
    vi.mocked(loadCourses).mockImplementationOnce(async () => {
      throw new ApiError("Can't reach the server.", 0, "network_error", null);
    });
    vi.mocked(loadCourses).mockResolvedValueOnce([COURSE]);
    render(<ProfessorDashboard />);

    expect((await screen.findByRole("alert")).textContent).toContain("Can't reach the server.");
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Try again" })));

    expect(screen.getByRole("region", { name: "Intro to Programming" })).toBeDefined();
  });

  it("adds a new course without reloading", async () => {
    vi.mocked(loadCourses).mockResolvedValue([]);
    vi.mocked(createCourse).mockResolvedValue({ ...COURSE, id: "c2", title: "Data Structures", assignments: [] });
    render(<ProfessorDashboard />);

    fireEvent.change(await screen.findByLabelText("New course"), { target: { value: "  Data Structures " } });
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Add course" })));

    expect(createCourse).toHaveBeenCalledWith("Data Structures");
    expect(screen.getByRole("region", { name: "Data Structures" })).toBeDefined();
    expect(screen.getByLabelText<HTMLInputElement>("New course").value).toBe("");
    expect(loadCourses).toHaveBeenCalledTimes(1);
  });
});
