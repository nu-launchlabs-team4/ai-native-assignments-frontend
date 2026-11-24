import { apiFetch } from "@/lib/api";
import { API_PATHS } from "@/lib/constants";

import { MOCK_DRAFT } from "./mock-draft";
import { createMockAssignmentClient } from "./mock-assignment-client";
import type { SetupAssignment } from "./types";

/** The save and publish calls the setup page makes. Both return the updated assignment. */
export interface AssignmentClient {
  /** Save the professor's edits. The questions replace the old list, in this order. */
  save(assignment: SetupAssignment): Promise<SetupAssignment>;
  /** Publish the draft so students can see it. */
  publish(assignmentId: string): Promise<SetupAssignment>;
}

/** The body of PATCH /assignments/{id} (backend #33): the editable fields only. */
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
