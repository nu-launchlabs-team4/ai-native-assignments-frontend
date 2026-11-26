import { apiFetch } from "@/lib/api";
import { API_PATHS, type Step } from "@/lib/constants";

/**
 * What the workspace records while a student works (backend #14). A paste keeps only its
 * size, never the text. Answer snapshots are recorded by the backend on every save.
 */
export type ActivityEvent =
  | {
      type: "paste";
      step: Step;
      question_id: string;
      occurred_at: string;
      detail: { characters: number };
    }
  | {
      type: "tab_leave" | "tab_return";
      step: Step;
      question_id: string;
      occurred_at: string;
    };

/** The backend's WorkSessionOut. */
export interface WorkSession {
  id: string;
  submission_id: string;
  started_at: string;
  ended_at: string | null;
}

export interface SendOptions {
  /** Lets the request finish after the page closes. */
  keepalive?: boolean;
}

export interface ActivityClient {
  startSession(submissionId: string): Promise<WorkSession>;
  sendEvents(sessionId: string, events: ActivityEvent[], options?: SendOptions): Promise<void>;
  endSession(sessionId: string, options?: SendOptions): Promise<void>;
}

/** The most events the backend takes in one request (its MAX_EVENTS_PER_BATCH). */
export const MAX_EVENTS_PER_BATCH = 100;

export const apiActivityClient: ActivityClient = {
  startSession: (submissionId) =>
    apiFetch<WorkSession>(`${API_PATHS.SUBMISSIONS}/${encodeURIComponent(submissionId)}/sessions`, {
      method: "POST",
    }),
  sendEvents: (sessionId, events, options) =>
    apiFetch<void>(`${API_PATHS.SESSIONS}/${encodeURIComponent(sessionId)}/events`, {
      method: "POST",
      body: { events },
      keepalive: options?.keepalive,
    }),
  endSession: (sessionId, options) =>
    apiFetch<void>(`${API_PATHS.SESSIONS}/${encodeURIComponent(sessionId)}/end`, {
      method: "POST",
      keepalive: options?.keepalive,
    }),
};
