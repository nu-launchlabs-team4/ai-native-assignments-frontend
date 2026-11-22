import type { Metadata } from "next";
import Link from "next/link";

import { PagePlaceholder } from "@/components/PagePlaceholder";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = { title: "Professor" };

export default function ProfessorPage() {
  return (
    <PagePlaceholder
      title="Professor dashboard"
      description="Set up an assignment from your PDF. The submissions review arrives in issue #11."
    >
      <Link
        href={ROUTES.PROFESSOR_NEW_ASSIGNMENT}
        className="self-start rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        Set up a new assignment
      </Link>
    </PagePlaceholder>
  );
}
