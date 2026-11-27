import type { Metadata } from "next";
import { Suspense } from "react";

import { ReviewLoading } from "@/features/submissions-review/components/ReviewLoading";
import { SessionsLoader } from "@/features/submissions-review/components/SessionsLoader";

export const metadata: Metadata = { title: "Work sessions" };

type SessionsPageProps = PageProps<"/professor/submissions/[submissionId]/sessions">;

export default function SessionsPage({ params }: SessionsPageProps) {
  return (
    <Suspense fallback={<ReviewLoading />}>
      <SessionsParams params={params} />
    </Suspense>
  );
}

async function SessionsParams({ params }: Pick<SessionsPageProps, "params">) {
  const { submissionId } = await params;
  return <SessionsLoader submissionId={submissionId} />;
}
