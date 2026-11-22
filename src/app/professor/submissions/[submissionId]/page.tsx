import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ReasoningSummaryView } from "@/features/submissions-review/components/ReasoningSummaryView";
import { ReviewLayout } from "@/features/submissions-review/components/ReviewLayout";
import { ReviewLoading } from "@/features/submissions-review/components/ReviewLoading";
import { getMockSubmission } from "@/features/submissions-review/mock-submissions";
import { assignmentSubmissionsRoute } from "@/lib/constants";

export const metadata: Metadata = { title: "Reasoning summary" };

type SummaryPageProps = PageProps<"/professor/submissions/[submissionId]">;

export default function SummaryPage({ params }: SummaryPageProps) {
  return (
    <Suspense fallback={<ReviewLoading />}>
      <SummaryLoader params={params} />
    </Suspense>
  );
}

async function SummaryLoader({ params }: Pick<SummaryPageProps, "params">) {
  const { submissionId } = await params;
  // TODO(dineshbachchani1234): load from the backend once BE#12 and BE#13 land (#11).
  const submission = getMockSubmission(submissionId);
  if (!submission) {
    notFound();
  }
  return (
    <ReviewLayout
      backHref={assignmentSubmissionsRoute(submission.assignment_id)}
      backLabel="All submissions"
      eyebrow={submission.assignment_title}
      title={submission.student_name}
    >
      <ReasoningSummaryView
        submissionId={submission.id}
        studentName={submission.student_name}
        summary={submission.summary}
      />
    </ReviewLayout>
  );
}
