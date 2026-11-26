import type { Metadata } from "next";
import { Suspense } from "react";

import { NewAssignment } from "@/features/assignment-setup/components/NewAssignment";
import { MOCK_COURSE_ID } from "@/features/assignment-setup/mock-draft";

export const metadata: Metadata = { title: "Set up assignment" };

type NewAssignmentPageProps = PageProps<"/professor/assignments/new">;

export default function NewAssignmentPage({ searchParams }: NewAssignmentPageProps) {
  // The query string is request data, so it's read behind Suspense.
  return (
    <Suspense>
      <NewAssignmentLoader searchParams={searchParams} />
    </Suspense>
  );
}

async function NewAssignmentLoader({ searchParams }: Pick<NewAssignmentPageProps, "searchParams">) {
  const { course } = await searchParams;
  // The dashboard's "New assignment" passes ?course=. Without it, the draft goes into the sample course.
  return <NewAssignment courseId={typeof course === "string" && course ? course : MOCK_COURSE_ID} />;
}
