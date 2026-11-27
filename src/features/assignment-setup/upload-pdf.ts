import { MOCK_DRAFT } from "./mock-draft";
import type { SetupAssignment } from "./types";

const MOCK_PARSE_DELAY_MS = 1200;

/**
 * The demo parse for the sample course: returns the sample draft as if the parser had
 * read the PDF. Real courses start an empty draft instead (see new-draft.ts).
 */
// TODO(dineshbachchani1234): replace with the backend's parse once backend #8 lands (#4).
export async function uploadPdf(courseId: string, file: File): Promise<SetupAssignment> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_PARSE_DELAY_MS));
  return { ...MOCK_DRAFT, course_id: courseId, source_pdf: file.name };
}
