import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ReviewLayout } from "@/features/submissions-review/components/ReviewLayout";
import { ReviewLoading } from "@/features/submissions-review/components/ReviewLoading";
import { TrailTimeline } from "@/features/submissions-review/components/TrailTimeline";
import { getMockTrail } from "@/features/submissions-review/mock-trail";
import { submissionSummaryRoute } from "@/lib/constants";

export const metadata: Metadata = { title: "Full trail" };

type TrailPageProps = PageProps<"/professor/submissions/[submissionId]/trail">;

export default function TrailPage({ params }: TrailPageProps) {
  return (
    <Suspense fallback={<ReviewLoading />}>
      <TrailLoader params={params} />
    </Suspense>
  );
}

async function TrailLoader({ params }: Pick<TrailPageProps, "params">) {
  const { submissionId } = await params;
  // TODO(dineshbachchani1234): load from the backend once BE#13 includes the trail (#12).
  const trail = getMockTrail(submissionId);
  if (!trail) {
    notFound();
  }
  return (
    <ReviewLayout
      backHref={submissionSummaryRoute(trail.submission_id)}
      backLabel="Reasoning summary"
      eyebrow={`Full trail · ${trail.assignment_title}`}
      title={trail.student_name}
    >
      <TrailTimeline entries={trail.entries} />
    </ReviewLayout>
  );
}
