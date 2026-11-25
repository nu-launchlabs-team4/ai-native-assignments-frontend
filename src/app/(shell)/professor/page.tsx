import type { Metadata } from "next";
import Link from "next/link";

import { ShellPage } from "@/features/app-shell/components/ShellPage";
import { ProfessorDashboard } from "@/features/professor-dashboard/components/ProfessorDashboard";
import { MOCK_REVIEW_ASSIGNMENT_ID } from "@/features/submissions-review/mock-submissions";
import { assignmentSubmissionsRoute } from "@/lib/constants";

export const metadata: Metadata = { title: "Professor" };

export default function ProfessorPage() {
  return (
    <ShellPage
      title="Courses"
      description={
        <>
          Add a course, upload an assignment PDF into it, and come back to your drafts.{" "}
          {/* TODO(dineshbachchani1234): remove the sample link once the submissions table loads real data (#11). */}
          <Link
            href={assignmentSubmissionsRoute(MOCK_REVIEW_ASSIGNMENT_ID)}
            className="text-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            See sample submissions
          </Link>
        </>
      }
    >
      <ProfessorDashboard />
    </ShellPage>
  );
}
