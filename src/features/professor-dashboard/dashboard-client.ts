import { apiFetch } from "@/lib/api";
import type { AssignmentOut, CourseOut } from "@/lib/api-types";
import { API_PATHS } from "@/lib/constants";

/** One course and its assignments, oldest first, as the dashboard shows them. */
export interface DashboardCourse extends CourseOut {
  assignments: readonly AssignmentOut[];
}

/** The professor's courses, each with its assignments. */
export async function loadCourses(): Promise<DashboardCourse[]> {
  const courses = await apiFetch<CourseOut[]>(API_PATHS.COURSES);
  return Promise.all(
    courses.map(async (course) => ({
      ...course,
      assignments: await apiFetch<AssignmentOut[]>(
        `${API_PATHS.ASSIGNMENTS}?course_id=${encodeURIComponent(course.id)}`,
      ),
    })),
  );
}

/** Create a course. It starts with no assignments. */
export async function createCourse(title: string): Promise<DashboardCourse> {
  const course = await apiFetch<CourseOut>(API_PATHS.COURSES, { method: "POST", body: { title } });
  return { ...course, assignments: [] };
}
