import { MOCK_DRAFT } from "./mock-draft";
import type { SetupAssignment } from "./types";

const MOCK_PARSE_DELAY_MS = 1200;

/**
 * Upload a PDF and get back the draft assignment the parser made from it: questions in
 * order, each with its answer type.
 */
// TODO(dineshbachchani1234): POST the file to /assignments/pdf with apiFetch once BE#7 and BE#8 land (#4).
export async function uploadPdf(courseId: string, file: File): Promise<SetupAssignment> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_PARSE_DELAY_MS));
  return { ...MOCK_DRAFT, course_id: courseId, source_pdf: file.name };
}
