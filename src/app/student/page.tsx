import type { Metadata } from "next";
import Link from "next/link";

import { PagePlaceholder } from "@/components/PagePlaceholder";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { MOCK_ASSIGNMENT_ID } from "@/features/workspace/mock-assignment";
import { STEP_LABELS, STEP_ORDER, studentAssignmentRoute } from "@/lib/constants";

export const metadata: Metadata = { title: "Student" };

// TODO(akashshetty1997): list the student's real assignments once the backend has them (#6).
export default function StudentPage() {
  return (
    <PagePlaceholder
      actions={<LogoutButton />}
      title="Student"
      description="Each assignment has five steps. The list of your assignments arrives with the backend."
    >
      <ol className="list-inside list-decimal text-foreground">
        {STEP_ORDER.map((step) => (
          <li key={step}>{STEP_LABELS[step]}</li>
        ))}
      </ol>
      <Link
        href={studentAssignmentRoute(MOCK_ASSIGNMENT_ID)}
        className="self-start rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        Open the sample assignment
      </Link>
    </PagePlaceholder>
  );
}
