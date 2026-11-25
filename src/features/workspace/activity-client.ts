
import { apiFetch } from "@/lib/api";
import type { Step } from "@/lib/constants";

// Activity events recorded by the student's workspace.
export type ActivityEvent =
  | {
      type: "paste";
      step: Step;
      question_id: string;
      occurred_at: string;
      detail: {
        characters: number;
      };
    }
  | {
      type: "tab_leave" | "tab_return";
      step: Step;
      question_id: string;
      occurred_at: string;
    };

// Response returned when a work session is created.
export interface StartSessionResponse {
  id: string;
  started_at: string;
}

// Options for sending events, including page-exit requests.
export interface SendEventsOptions {
  keepalive?: boolean;
}

// Defines the operations supported by an activity client.
export interface ActivityClient {
  startSession(submissionId: string): Promise<StartSessionResponse>;

  sendEvents(
    sessionId: string,
    events: ActivityEvent[],
    options?: SendEventsOptions,
  ): Promise<void>;

  endSession(sessionId: string): Promise<void>;
}

// Real API implementation.
// These endpoint paths are provisional and must be confirmed with backend #14.
export const apiActivityClient: ActivityClient = {
  async startSession(submissionId) {
    return apiFetch<StartSessionResponse>(
      `/submissions/${encodeURIComponent(submissionId)}/sessions`,
      {
        method: "POST",
      },
    );
  },

  async sendEvents(sessionId, events, options) {
    await apiFetch<void>(
      `/sessions/${encodeURIComponent(sessionId)}/events`,
      {
        method: "POST",
        body: { events },
        keepalive: options?.keepalive,
      },
    );
  },

  async endSession(sessionId) {
    await apiFetch<void>(
      `/sessions/${encodeURIComponent(sessionId)}/end`,
      {
        method: "POST",
      },
    );
  },
};
