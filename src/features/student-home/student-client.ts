import { apiFetch } from "@/lib/api";
import type { EnrollmentOut, StudentAssignmentOut } from "@/lib/api-types";
import { API_PATHS } from "@/lib/constants";

/** The published assignments in the student's courses, newest first, with their progress. */
export function loadStudentAssignments(): Promise<StudentAssignmentOut[]> {
  return apiFetch<StudentAssignmentOut[]>(API_PATHS.STUDENT_ASSIGNMENTS);
}

/** Join a course with the code from the professor. The backend accepts any case, with or without the dash. */
export function joinCourse(code: string): Promise<EnrollmentOut> {
  return apiFetch<EnrollmentOut>(API_PATHS.COURSES_JOIN, { method: "POST", body: { code } });
}
