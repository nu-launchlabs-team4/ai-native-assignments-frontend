import type { Metadata } from "next";

import { NewAssignment } from "@/features/assignment-setup/components/NewAssignment";
import { MOCK_COURSE_ID } from "@/features/assignment-setup/mock-draft";

export const metadata: Metadata = { title: "Set up assignment" };

export default function NewAssignmentPage() {
  // TODO(dineshbachchani1234): let the professor pick one of their courses (GET /courses) once login works (#4).
  return <NewAssignment courseId={MOCK_COURSE_ID} />;
}
