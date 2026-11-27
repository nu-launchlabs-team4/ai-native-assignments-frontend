import { ApiError } from "@/lib/api";

import type { AssignmentClient } from "./assignment-client";
import type { SetupAssignment } from "./types";

const MOCK_DELAY_MS = 400;
const ALREADY_PUBLISHED = "This assignment is already published, so it can't be changed.";

function wait(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
}

/**
 * In-browser stand-in for the sample draft. It follows the backend's rules: a published
 * assignment can't be edited or published again (409).
 */
export function createMockAssignmentClient(initial: SetupAssignment): AssignmentClient {
  let saved = initial;

  function refuseIfPublished(): void {
    if (saved.published_at !== null) {
      throw new ApiError(ALREADY_PUBLISHED, 409, "conflict", null);
    }
  }

  return {
    // The sample draft already exists, so these only hand back what the page has.
    async create(assignment) {
      await wait();
      saved = assignment;
      return saved;
    },
    async attachPdf(_assignmentId, file) {
      await wait();
      saved = { ...saved, source_pdf: file.name };
      return saved;
    },
    async save(assignment) {
      await wait();
      refuseIfPublished();
      saved = assignment;
      return saved;
    },
    async publish() {
      await wait();
      refuseIfPublished();
      saved = { ...saved, published_at: new Date().toISOString() };
      return saved;
    },
  };
}
