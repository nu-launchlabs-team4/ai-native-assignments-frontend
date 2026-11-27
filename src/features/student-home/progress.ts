import type { StudentAssignmentOut } from "@/lib/api-types";
import { STEP_LABELS, STEP_ORDER, SubmissionStatus } from "@/lib/constants";

/** Where the student is on an assignment: "Not started", "Step 2 of 5: Feedback" or "Submitted". */
export function progressLabel(assignment: StudentAssignmentOut): string {
  if (assignment.status === null || assignment.current_step === null) return "Not started";
  if (assignment.status === SubmissionStatus.SUBMITTED) return "Submitted";
  const stepNumber = STEP_ORDER.indexOf(assignment.current_step) + 1;
  return `Step ${stepNumber} of ${STEP_ORDER.length}: ${STEP_LABELS[assignment.current_step]}`;
}
