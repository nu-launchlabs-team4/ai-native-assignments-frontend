import { type RefObject, useCallback, useEffect, useRef } from "react";

import { ApiError } from "@/lib/api";
import type { Step } from "@/lib/constants";

import { type ActivityClient, type ActivityEvent, MAX_EVENTS_PER_BATCH } from "./activity-client";

/** How often queued events are sent. */
export const ACTIVITY_FLUSH_INTERVAL_MS = 10_000;

interface Place {
  step: Step;
  questionId: string;
}

interface ActivityTrackingOptions extends Place {
  client: ActivityClient;
  submissionId: string;
  /** Off once the submission is submitted: there is nothing left to track. */
  enabled: boolean;
}

/** Where and when an event happened, in the backend's field names. */
function stamp(place: RefObject<Place>) {
  return { step: place.current.step, question_id: place.current.questionId, occurred_at: new Date().toISOString() };
}

// The backend answers 404 or 409 when the session is gone, for example ended by another tab.
function sessionIsGone(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 404 || error.status === 409);
}

/**
 * Records pastes (their size only) and leaving or returning to the tab in a work session,
 * and sends them in batches. Tracking never gets in the student's way: a failed request
 * keeps its events for the next batch and is otherwise ignored.
 */
export function useActivityTracking({ client, submissionId, step, questionId, enabled }: ActivityTrackingOptions) {
  const sessionIdRef = useRef<string | null>(null);
  const queueRef = useRef<ActivityEvent[]>([]);
  const sendingRef = useRef(false);
  // Listeners read the current step and question without subscribing again.
  const placeRef = useRef<Place>({ step, questionId });
  useEffect(() => {
    placeRef.current = { step, questionId };
  }, [step, questionId]);

  const flush = useCallback(
    async (keepalive = false) => {
      const sessionId = sessionIdRef.current;
      if (!sessionId || sendingRef.current || queueRef.current.length === 0) return;

      const batch = queueRef.current.splice(0, MAX_EVENTS_PER_BATCH);
      sendingRef.current = true;
      try {
        await client.sendEvents(sessionId, batch, { keepalive });
      } catch (error) {
        queueRef.current.unshift(...batch);
        if (sessionIsGone(error)) {
          // Start a fresh session; the next batch goes there.
          sessionIdRef.current = null;
          sessionIdRef.current = await client
            .startSession(submissionId)
            .then((session) => session.id)
            .catch(() => null);
        }
      } finally {
        sendingRef.current = false;
      }
    },
    [client, submissionId],
  );

  const record = useCallback(
    (event: ActivityEvent) => {
      if (enabled) queueRef.current.push(event);
    },
    [enabled],
  );

  // One session while the workspace is open, ended when the student leaves it.
  useEffect(() => {
    if (!enabled) return;
    let left = false;

    function end(sessionId: string | null, keepalive: boolean) {
      if (!sessionId) return;
      if (sessionIdRef.current === sessionId) sessionIdRef.current = null;
      void client.endSession(sessionId, { keepalive }).catch(() => undefined);
    }

    client
      .startSession(submissionId)
      .then((session) => {
        // Left before the session started: close it without touching a newer one.
        if (left) return end(session.id, false);
        sessionIdRef.current = session.id;
        void flush();
      })
      .catch(() => undefined);

    function handleVisibilityChange() {
      const hidden = document.visibilityState === "hidden";
      record({ type: hidden ? "tab_leave" : "tab_return", ...stamp(placeRef) });
      // The page may be closing, so send what's queued while it still can.
      if (hidden) void flush(true);
    }

    // Closing or reloading the tab. Hiding it already sent the queued events.
    function handlePageHide() {
      end(sessionIdRef.current, true);
    }

    const interval = window.setInterval(() => void flush(), ACTIVITY_FLUSH_INTERVAL_MS);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      left = true;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
      // Leaving the workspace inside the app: send what's left, then end the session.
      const sessionId = sessionIdRef.current;
      void flush().finally(() => end(sessionId, false));
    };
  }, [client, submissionId, enabled, flush, record]);

  const recordPaste = useCallback(
    (characters: number) => record({ type: "paste", ...stamp(placeRef), detail: { characters } }),
    [record],
  );

  return { recordPaste };
}
