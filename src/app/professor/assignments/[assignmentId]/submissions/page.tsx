import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ReviewLayout } from "@/features/submissions-review/components/ReviewLayout";
import { ReviewLoading } from "@/features/submissions-review/components/ReviewLoading";
import { SubmissionsTable } from "@/features/submissions-review/components/SubmissionsTable";
import { getMockSubmissions } from "@/features/submissions-review/mock-submissions";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = { title: "Submissions" };

type SubmissionsPageProps = PageProps<"/professor/assignments/[assignmentId]/submissions">;

export default function SubmissionsPage({ params }: SubmissionsPageProps) {
  // Reading params happens at request time, so it streams in behind Suspense.
  return (
    <Suspense fallback={<ReviewLoading />}>
      <SubmissionsLoader params={params} />
    </Suspense>
  );
}

async function SubmissionsLoader({ params }: Pick<SubmissionsPageProps, "params">) {
  const { assignmentId } = await params;
  // TODO(dineshbachchani1234): load from the backend once BE#13 lands (#11).
  const table = getMockSubmissions(assignmentId);
  if (!table) {
    notFound();
  }
  return (
    <ReviewLayout backHref={ROUTES.PROFESSOR} backLabel="Professor dashboard" eyebrow="Submissions" title={table.assignment_title}>
      <SubmissionsTable submissions={table.submissions} />
    </ReviewLayout>
  );
}
