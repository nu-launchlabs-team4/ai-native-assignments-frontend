import type { Metadata } from "next";
import { Suspense } from "react";

import { CoursePicker } from "@/features/assignment-setup/components/CoursePicker";
import { NewAssignment } from "@/features/assignment-setup/components/NewAssignment";

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
  // The dashboard's "New assignment" passes ?course=. The sidebar's doesn't, so the professor picks one first.
  // The sample course is ?course=course-1 (MOCK_COURSE_ID), which runs the demo without a backend.
  return typeof course === "string" && course ? <NewAssignment courseId={course} /> : <CoursePicker />;
}
