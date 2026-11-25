import type { Metadata } from "next";
import { Suspense } from "react";

import { AssignmentSetupLoader } from "@/features/assignment-setup/components/AssignmentSetupLoader";

export const metadata: Metadata = { title: "Set up assignment" };

type SetupPageProps = PageProps<"/professor/assignments/[assignmentId]">;

export default function SetupPage({ params }: SetupPageProps) {
  // Reading params happens at request time, so it streams in behind Suspense.
  return (
    <Suspense>
      <SetupParams params={params} />
    </Suspense>
  );
}

async function SetupParams({ params }: Pick<SetupPageProps, "params">) {
  const { assignmentId } = await params;
  return <AssignmentSetupLoader assignmentId={assignmentId} />;
}
