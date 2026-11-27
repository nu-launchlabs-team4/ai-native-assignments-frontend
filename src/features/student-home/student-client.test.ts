import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiFetch } from "@/lib/api";

import { joinCourse, loadStudentAssignments } from "./student-client";

vi.mock("@/lib/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api")>()),
  apiFetch: vi.fn().mockResolvedValue([]),
}));

beforeEach(() => {
  vi.mocked(apiFetch).mockClear();
});

describe("student client", () => {
  it("lists the student's assignments with GET /student/assignments", async () => {
    await loadStudentAssignments();

    expect(apiFetch).toHaveBeenCalledWith("/student/assignments");
  });

  it("joins a course with POST /courses/join and the code as typed", async () => {
    await joinCourse("7k4q m2xp");

    expect(apiFetch).toHaveBeenCalledWith("/courses/join", { method: "POST", body: { code: "7k4q m2xp" } });
  });
});
