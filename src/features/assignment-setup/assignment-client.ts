import { apiFetch } from "@/lib/api";
import { API_PATHS } from "@/lib/constants";

import { MOCK_DRAFT } from "./mock-draft";
import { createMockAssignmentClient } from "./mock-assignment-client";
import type { SetupAssignment } from "./types";

/** The calls the setup page makes. Each returns the assignment as the backend now has it. */
export interface AssignmentClient {
  /** Create the assignment from a draft that so far exists only in the browser. */
  create(assignment: SetupAssignment): Promise<SetupAssignment>;
  /** Attach the professor's PDF to a saved draft. */
  attachPdf(assignmentId: string, file: File): Promise<SetupAssignment>;
  /** Save the professor's edits. The questions replace the old list, in this order. */
  save(assignment: SetupAssignment): Promise<SetupAssignment>;
  /** Publish the draft so students can see it. */
  publish(assignmentId: string): Promise<SetupAssignment>;
}

/** The editable fields, as PATCH /assignments/{id} takes them (POST /assignments adds course_id). */
export function toUpdateBody(assignment: SetupAssignment) {
  return {
    title: assignment.title,
    instructions: assignment.instructions,
    ai_policy: assignment.ai_policy,
    help_level: assignment.help_level,
    final_check: assignment.final_check,
    questions: assignment.questions.map(({ prompt, answer_type, language, starter_code }) => ({
      prompt,
      answer_type,
      language,
      starter_code,
    })),
  };
}

function assignmentPath(assignmentId: string, ...rest: string[]): string {
  return [API_PATHS.ASSIGNMENTS, encodeURIComponent(assignmentId), ...rest].join("/");
}

/** Talks to the backend's /assignments endpoints. */
export const apiAssignmentClient: AssignmentClient = {
  create: (assignment) =>
    apiFetch<SetupAssignment>(API_PATHS.ASSIGNMENTS, {
      method: "POST",
      body: { course_id: assignment.course_id, ...toUpdateBody(assignment) },
    }),
  attachPdf: (assignmentId, file) => {
    const form = new FormData();
    form.append("file", file);
    return apiFetch<SetupAssignment>(assignmentPath(assignmentId, "pdf"), { method: "POST", body: form });
  },
  save: (assignment) =>
    apiFetch<SetupAssignment>(assignmentPath(assignment.id), {
      method: "PATCH",
      body: toUpdateBody(assignment),
    }),
  publish: (assignmentId) =>
    apiFetch<SetupAssignment>(assignmentPath(assignmentId, "publish"), { method: "POST" }),
};

/** The sample draft stays in the browser. Every real assignment uses the backend. */
export function assignmentClientFor(assignment: SetupAssignment): AssignmentClient {
  return assignment.id === MOCK_DRAFT.id ? createMockAssignmentClient(assignment) : apiAssignmentClient;
}
