import { AIPolicy, FinalCheck, HelpLevel, MAX_ASSIGNMENT_TITLE_CHARS } from "@/lib/constants";

import { newQuestion } from "./questions";
import type { SetupAssignment } from "./types";

/** The id of a draft that exists only in the browser, before its first save creates it. */
export const NEW_ASSIGNMENT_ID = "new";

/** True until the first save creates the assignment on the backend. */
export function isUnsaved(assignment: SetupAssignment): boolean {
  return assignment.id === NEW_ASSIGNMENT_ID;
}

/** A readable starting title from the file name: "week-3_loops.pdf" becomes "week 3 loops". */
export function titleFromFileName(fileName: string): string {
  const title = fileName
    .replace(/\.pdf$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return (title || "Untitled assignment").slice(0, MAX_ASSIGNMENT_TITLE_CHARS);
}

/**
 * A new draft for a real course, started from the professor's PDF with one empty question.
 * Nothing is sent until the professor saves.
 */
// TODO(dineshbachchani1234): start from the parsed questions once backend #8 reads the PDF (#4).
export function blankDraft(courseId: string, file: File): SetupAssignment {
  return {
    id: NEW_ASSIGNMENT_ID,
    course_id: courseId,
    title: titleFromFileName(file.name),
    instructions: "",
    source_pdf: file.name,
    ai_policy: AIPolicy.PERMITTED,
    help_level: HelpLevel.HINTS,
    final_check: FinalCheck.AI_INTERVIEW,
    published_at: null,
    created_at: new Date().toISOString(),
    questions: [newQuestion(1)],
  };
}
