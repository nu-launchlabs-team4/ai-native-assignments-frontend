import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Workspace } from "@/features/workspace/components/Workspace";
import { WorkspaceSkeleton } from "@/features/workspace/components/WorkspaceSkeleton";
import { getMockAssignment } from "@/features/workspace/mock-assignment";

export const metadata: Metadata = { title: "Workspace" };

type WorkspacePageProps = PageProps<"/student/assignments/[assignmentId]">;

export default function WorkspacePage({ params }: WorkspacePageProps) {
  // Reading params happens at request time, so it streams in behind Suspense.
  return (
    <Suspense fallback={<WorkspaceSkeleton />}>
      <WorkspaceLoader params={params} />
    </Suspense>
  );
}

async function WorkspaceLoader({ params }: Pick<WorkspacePageProps, "params">) {
  const { assignmentId } = await params;
  // TODO(akashshetty1997): load the assignment from the backend once BE#9 lands (#6).
  const assignment = getMockAssignment(assignmentId);
  if (!assignment) {
    notFound();
  }
  return <Workspace assignment={assignment} />;
}
