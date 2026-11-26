import { type ActivityClient, type ActivityEvent, apiActivityClient } from "./activity-client";
import { MOCK_ASSIGNMENT_ID } from "./mock-assignment";

interface MockSession {
  submissionId: string;
  endedAt: string | null;
  events: ActivityEvent[];
}

export interface MockActivityClient extends ActivityClient {
  /** What was recorded, for tests. */
  sessions: Map<string, MockSession>;
}

/** An in-memory stand-in for the sample assignment, with the backend's rules. */
export function createMockActivityClient(): MockActivityClient {
  const sessions = new Map<string, MockSession>();
  let nextId = 1;

  return {
    sessions,
    async startSession(submissionId) {
      const now = new Date().toISOString();
      // Like the backend, a new session ends any the student left open in another tab.
      for (const session of sessions.values()) {
        if (session.submissionId === submissionId && !session.endedAt) session.endedAt = now;
      }
      const id = `mock-session-${nextId++}`;
      sessions.set(id, { submissionId, endedAt: null, events: [] });
      return { id, submission_id: submissionId, started_at: now, ended_at: null };
    },
    async sendEvents(sessionId, events) {
      const session = sessions.get(sessionId);
      if (!session) throw new Error("Session not found");
      if (session.endedAt) throw new Error("This session has ended. Start a new one");
      session.events.push(...events);
    },
    async endSession(sessionId) {
      const session = sessions.get(sessionId);
      if (session && !session.endedAt) session.endedAt = new Date().toISOString();
    },
  };
}

const mockActivityClient = createMockActivityClient();

/** The sample assignment records to memory; every other assignment to the backend. */
export function activityClientFor(assignmentId: string): ActivityClient {
  return assignmentId === MOCK_ASSIGNMENT_ID ? mockActivityClient : apiActivityClient;
}
