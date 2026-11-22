import type { Metadata } from "next";

import { AssignmentSetup } from "@/features/assignment-setup/components/AssignmentSetup";
import { MOCK_DRAFT } from "@/features/assignment-setup/mock-draft";

export const metadata: Metadata = { title: "Set up assignment" };

export default function NewAssignmentPage() {
  // TODO(dineshbachchani1234): start from the draft the PDF parser returns once BE#8 lands (#4).
  return <AssignmentSetup initialAssignment={MOCK_DRAFT} />;
}
