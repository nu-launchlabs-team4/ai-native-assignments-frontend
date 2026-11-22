import type { Metadata } from "next";
import Link from "next/link";

import { PagePlaceholder } from "@/components/PagePlaceholder";
import { MOCK_REVIEW_ASSIGNMENT_ID } from "@/features/submissions-review/mock-submissions";
import { assignmentSubmissionsRoute } from "@/lib/constants";

export const metadata: Metadata = { title: "Professor" };

// TODO(dineshbachchani1234): list the professor's real assignments once the backend has them (#11).
export default function ProfessorPage() {
  return (
    <PagePlaceholder
      title="Professor dashboard"
      description="Assignment setup arrives in issue #4. Review the sample assignment's submissions below."
    >
      <Link
        href={assignmentSubmissionsRoute(MOCK_REVIEW_ASSIGNMENT_ID)}
        className="self-start rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        Review submissions
      </Link>
    </PagePlaceholder>
  );
}
