import type { Metadata } from "next";
import { Suspense } from "react";

import { WorkspaceLoader } from "@/features/workspace/components/WorkspaceLoader";
import { WorkspaceSkeleton } from "@/features/workspace/components/WorkspaceSkeleton";

export const metadata: Metadata = { title: "Workspace" };

type WorkspacePageProps = PageProps<"/student/assignments/[assignmentId]">;

export default function WorkspacePage({ params }: WorkspacePageProps) {
  // Reading params happens at request time, so it streams in behind Suspense.
  return (
    <Suspense fallback={<WorkspaceSkeleton />}>
      <WorkspaceForParams params={params} />
    </Suspense>
  );
}

async function WorkspaceForParams({ params }: Pick<WorkspacePageProps, "params">) {
  const { assignmentId } = await params;
  // The submission is started in the browser, so the backend's session cookie goes with it.
  return <WorkspaceLoader assignmentId={assignmentId} />;
}
