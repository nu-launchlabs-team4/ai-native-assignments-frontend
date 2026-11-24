import type { Metadata } from "next";
import Link from "next/link";

import { buttonClassName } from "@/components/ui/Button";
import { ShellPage } from "@/features/app-shell/components/ShellPage";
import { MOCK_ASSIGNMENT_ID } from "@/features/workspace/mock-assignment";
import { STEP_LABELS, STEP_ORDER, studentAssignmentRoute } from "@/lib/constants";

export const metadata: Metadata = { title: "Student" };

// TODO(akashshetty1997): list the student's real assignments once the backend has them (#6).
export default function StudentPage() {
  return (
    <ShellPage
      title="Assignments"
      description="Each assignment has five steps. The list of your assignments arrives with the backend."
    >
      <ol className="list-inside list-decimal text-foreground">
        {STEP_ORDER.map((step) => (
          <li key={step}>{STEP_LABELS[step]}</li>
        ))}
      </ol>
      <Link
        href={studentAssignmentRoute(MOCK_ASSIGNMENT_ID)}
        className={buttonClassName({ className: "self-start" })}
      >
        Open the sample assignment
      </Link>
    </ShellPage>
  );
}
