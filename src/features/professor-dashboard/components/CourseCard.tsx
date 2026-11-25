import Link from "next/link";

import { buttonClassName } from "@/components/ui/Button";
import type { AssignmentOut } from "@/lib/api-types";
import { assignmentSetupRoute, assignmentSubmissionsRoute, newAssignmentRoute } from "@/lib/constants";

import type { DashboardCourse } from "../dashboard-client";

const DATE = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" });

function AssignmentRow({ assignment }: { assignment: AssignmentOut }) {
  const publishedAt = assignment.published_at;
  const published = publishedAt !== null;
  // A draft goes back to setup; a published assignment opens its submissions.
  const href = published ? assignmentSubmissionsRoute(assignment.id) : assignmentSetupRoute(assignment.id);
  const date = published
    ? `Published ${DATE.format(new Date(publishedAt))}`
    : `Created ${DATE.format(new Date(assignment.created_at))}`;

  return (
    <li className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3">
      <Link
        href={href}
        className="font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        {assignment.title}
      </Link>
      <span className="flex items-center gap-3 text-footnote text-muted">
        <span
          className={`rounded-full px-2 py-0.5 text-caption font-medium ${published ? "bg-accent-soft text-accent" : "bg-fill text-foreground"}`}
        >
          {published ? "Published" : "Draft"}
        </span>
        {date}
      </span>
    </li>
  );
}

/** One course: its assignments, and a link to start a new one from a PDF. */
export function CourseCard({ course }: { course: DashboardCourse }) {
  const headingId = `course-${course.id}`;

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-2 rounded-lg border border-line bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id={headingId} className="text-headline">
          {course.title}
        </h2>
        <Link href={newAssignmentRoute(course.id)} className={buttonClassName({ variant: "filled", size: "small" })}>
          New assignment
        </Link>
      </div>
      {/* TODO(dineshbachchani1234): show the course's join code with a Copy button once backend #35 lands (#44). */}
      {course.assignments.length === 0 ? (
        <p className="text-callout text-muted">No assignments yet. Upload a PDF to start one.</p>
      ) : (
        <ul aria-label={`Assignments in ${course.title}`} className="divide-y divide-line">
          {course.assignments.map((assignment) => (
            <AssignmentRow key={assignment.id} assignment={assignment} />
          ))}
        </ul>
      )}
    </section>
  );
}
