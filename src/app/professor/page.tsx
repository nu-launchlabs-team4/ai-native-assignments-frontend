import type { Metadata } from "next";
import Link from "next/link";

import { PagePlaceholder } from "@/components/PagePlaceholder";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { MOCK_REVIEW_ASSIGNMENT_ID } from "@/features/submissions-review/mock-submissions";
import { assignmentSubmissionsRoute, ROUTES } from "@/lib/constants";

export const metadata: Metadata = { title: "Professor" };

const LINK_CLASS =
  "rounded-md px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2";

// TODO(dineshbachchani1234): list the professor's real assignments once the backend has them (#11).
export default function ProfessorPage() {
  return (
    <PagePlaceholder
      actions={<LogoutButton />}
      title="Professor dashboard"
      description="Set up an assignment from your PDF, or review the sample assignment's submissions."
    >
      <div className="flex flex-wrap gap-3">
        <Link
          href={ROUTES.PROFESSOR_NEW_ASSIGNMENT}
          className={`${LINK_CLASS} bg-accent text-accent-foreground hover:opacity-90`}
        >
          Set up a new assignment
        </Link>
        <Link
          href={assignmentSubmissionsRoute(MOCK_REVIEW_ASSIGNMENT_ID)}
          className={`${LINK_CLASS} border border-line bg-surface hover:bg-surface-muted`}
        >
          Review submissions
        </Link>
      </div>
    </PagePlaceholder>
  );
}
