import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ReviewLayout } from "@/features/submissions-review/components/ReviewLayout";
import { ReviewLoading } from "@/features/submissions-review/components/ReviewLoading";
import { SessionTimeline } from "@/features/submissions-review/components/SessionTimeline";
import { getMockSessions } from "@/features/submissions-review/mock-sessions";
import { submissionSummaryRoute } from "@/lib/constants";

export const metadata: Metadata = { title: "Work sessions" };

type SessionsPageProps = PageProps<"/professor/submissions/[submissionId]/sessions">;

export default function SessionsPage({ params }: SessionsPageProps) {
  return (
    <Suspense fallback={<ReviewLoading />}>
      <SessionsLoader params={params} />
    </Suspense>
  );
}

async function SessionsLoader({ params }: Pick<SessionsPageProps, "params">) {
  const { submissionId } = await params;
  // TODO(dineshbachchani1234): load from the backend once BE#14 has a sessions endpoint (#14).
  const data = getMockSessions(submissionId);
  if (!data) {
    notFound();
  }
  return (
    <ReviewLayout
      backHref={submissionSummaryRoute(data.submission_id)}
      backLabel="Reasoning summary"
      eyebrow={`Work sessions · ${data.assignment_title}`}
      title={data.student_name}
    >
      <SessionTimeline sessions={data.sessions} />
    </ReviewLayout>
  );
}
