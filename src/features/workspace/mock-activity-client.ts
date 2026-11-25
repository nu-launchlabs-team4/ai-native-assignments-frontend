
import {
  apiActivityClient,
  type ActivityClient,
  type ActivityEvent,
  type StartSessionResponse,
} from "./activity-client";

// In-memory store for mock activity sessions.
const sessions = new Map<
  string,
  {
    submissionId: string;
    startedAt: string;
    events: ActivityEvent[];
    endedAt: string | null;
  }
>();

export const mockActivityClient: ActivityClient = {
  async startSession(submissionId): Promise<StartSessionResponse> {
    const id = `mock-session-${submissionId}-${Date.now()}`;
    const startedAt = new Date().toISOString();

    sessions.set(id, {
      submissionId,
      startedAt,
      events: [],
      endedAt: null,
    });

    return {
      id,
      started_at: startedAt,
    };
  },

  async sendEvents(sessionId, events) {
    const session = sessions.get(sessionId);

    if (!session) {
      throw new Error(`Mock session not found: ${sessionId}`);
    }

    if (session.endedAt) {
      throw new Error(`Mock session has already ended: ${sessionId}`);
    }

    session.events.push(...events);
  },

  async endSession(sessionId) {
    const session = sessions.get(sessionId);

    if (!session) {
      throw new Error(`Mock session not found: ${sessionId}`);
    }

    session.endedAt = new Date().toISOString();
  },
};

// Select the mock client for the sample assignment.
export function activityClientFor(
  assignmentId: string,
): ActivityClient {
  return assignmentId === "sample-1"
    ? mockActivityClient
    : apiActivityClient;
}
