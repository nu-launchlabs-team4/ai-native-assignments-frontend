import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/PagePlaceholder";

export const metadata: Metadata = { title: "Professor" };

export default function ProfessorPage() {
  return (
    <PagePlaceholder
      title="Professor dashboard"
      description="Assignment setup arrives in issue #4, and the submissions review in issue #11."
    />
  );
}
