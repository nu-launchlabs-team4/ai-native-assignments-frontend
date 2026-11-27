import Link from "next/link";

import type { StudentAssignmentOut } from "@/lib/api-types";
import { studentAssignmentRoute, SubmissionStatus } from "@/lib/constants";

import { progressLabel } from "../progress";

/** The student's assignments, newest first. Each opens the workspace, where the work resumes. */
export function StudentAssignmentList({ assignments }: { assignments: readonly StudentAssignmentOut[] }) {
  return (
    <ul aria-label="Your assignments" className="divide-y divide-line rounded-lg border border-line bg-surface">
      {assignments.map((assignment) => {
        const submitted = assignment.status === SubmissionStatus.SUBMITTED;
        return (
          <li key={assignment.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3">
            <div className="flex min-w-0 flex-col">
              <Link
                href={studentAssignmentRoute(assignment.id)}
                className="font-medium text-foreground underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              >
                {assignment.title}
              </Link>
              <span className="text-footnote text-muted">{assignment.course_title}</span>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-caption font-medium ${submitted ? "bg-fill text-foreground" : "bg-accent-soft text-accent"}`}
            >
              {progressLabel(assignment)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
