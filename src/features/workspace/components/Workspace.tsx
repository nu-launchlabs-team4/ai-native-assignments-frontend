
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ThemeToggle } from "@/components/ThemeToggle";
import { ChatPanel } from "@/features/chat/components/ChatPanel";

import type { Answers, WorkspaceAssignment } from "../types";
import {
  useActivityTracking,
  type ActivityEvent as BrowserActivityEvent,
} from "../hooks/useActivityTracking";
import type { ActivityEvent as ClientActivityEvent } from "../activity-client";
import { mockActivityClient } from "../mock-activity-client";
import { AnswerPanel } from "./AnswerPanel";
import { AssignmentPanel } from "./AssignmentPanel";
import { StatusBar } from "./StatusBar";
import { StepStepper } from "./StepStepper";
import { WorkspaceShell } from "./WorkspaceShell";

interface WorkspaceProps {
  assignment: WorkspaceAssignment;
}

function initialAnswers(assignment: WorkspaceAssignment): Answers {
  return Object.fromEntries(
    assignment.questions.map((question) => [
      question.id,
      question.starterAnswer,
    ]),
  );
}

const ACTIVITY_BATCH_INTERVAL_MS = 10_000;

/**
 * The student's workspace for one assignment.
 * Holds the selected question and answers, and records activity events.
 */
export function Workspace({ assignment }: WorkspaceProps) {
  const [selectedQuestionId, setSelectedQuestionId] = useState(
    assignment.questions[0].id,
  );

  const [answers, setAnswers] = useState<Answers>(() =>
    initialAnswers(assignment),
  );

  const [showActivityNotice, setShowActivityNotice] = useState(true);

  // Use the mock client only for the sample assignment.
  // The real API needs the actual submission ID, which is not available here yet.
  const activityClient =
    assignment.id === "sample-1" ? mockActivityClient : null;

  const sessionIdRef = useRef<string | null>(null);
  const pendingEventsRef = useRef<ClientActivityEvent[]>([]);
  const sendingRef = useRef(false);
  const endedRef = useRef(false);

  const questionIndex = assignment.questions.findIndex(
    (question) => question.id === selectedQuestionId,
  );

  const question = assignment.questions[questionIndex];
  const questionNumber = questionIndex + 1;

  // Send queued events to the activity client.
  const flushEvents = useCallback(
    async (keepalive = false) => {
      if (!activityClient) return;

      const sessionId = sessionIdRef.current;

      if (
        !sessionId ||
        pendingEventsRef.current.length === 0 ||
        sendingRef.current
      ) {
        return;
      }

      const batch = pendingEventsRef.current.splice(0);
      sendingRef.current = true;

      try {
        await activityClient.sendEvents(
          sessionId,
          batch,
          keepalive ? { keepalive: true } : undefined,
        );
      } catch (error) {
        // Restore failed events so a later batch can retry them.
        pendingEventsRef.current = [
          ...batch,
          ...pendingEventsRef.current,
        ];

        console.error("Could not send activity events:", error);
      } finally {
        sendingRef.current = false;
      }
    },
    [activityClient],
  );

  // Create a mock session when the sample assignment opens.
  useEffect(() => {
    if (!activityClient) return;

    let cancelled = false;

    void activityClient
      .startSession(assignment.id)
      .then(({ id }) => {
        if (cancelled) {
          void activityClient.endSession(id);
          return;
        }

        sessionIdRef.current = id;
        void flushEvents();
      })
      .catch((error) => {
        console.error("Could not start activity session:", error);
      });

    return () => {
      cancelled = true;
    };
  }, [activityClient, assignment.id, flushEvents]);

  // Send accumulated events approximately every 10 seconds.
  useEffect(() => {
    if (!activityClient) return;

    const intervalId = window.setInterval(() => {
      void flushEvents();
    }, ACTIVITY_BATCH_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [activityClient, flushEvents]);

  // Flush remaining events and end the session when the page is leaving.
  useEffect(() => {
    const client = activityClient;

    if (!client) return;

    function handlePageHide() {
      if (!client) return;

      const sessionId = sessionIdRef.current;

      if (!sessionId || endedRef.current) return;

      endedRef.current = true;

      void flushEvents(true).finally(() => {
        void client.endSession(sessionId).catch((error) => {
          console.error("Could not end activity session:", error);
        });
      });
    }

    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [activityClient, flushEvents]);

  // Convert browser events into the activity-client format.
  const handleActivity = useCallback(
    (event: BrowserActivityEvent) => {
      console.log("Activity detected:", event);

      if (!activityClient) return;

      let clientEvent: ClientActivityEvent;

      if (event.type === "paste") {
        clientEvent = {
          type: "paste",
          step: assignment.currentStep,
          question_id: event.questionId,
          occurred_at: event.timestamp,
          detail: event.detail,
        };
      } else {
        clientEvent = {
          type: event.type,
          step: assignment.currentStep,
          question_id: event.questionId,
          occurred_at: event.timestamp,
        };
      }

      pendingEventsRef.current.push(clientEvent);
    },
    [activityClient, assignment.currentStep],
  );

  const { recordPaste } = useActivityTracking({
    questionId: question.id,
    onActivity: handleActivity,
  });

  return (
    <WorkspaceShell
      header={
        <>
          <h1 className="truncate text-sm font-semibold">
            {assignment.title}
          </h1>

          <StepStepper currentStep={assignment.currentStep} />

          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </>
      }
      notice={
        showActivityNotice ? (
          <div
            role="note"
            className="flex shrink-0 items-start gap-3 border-b border-line bg-surface-muted px-4 py-3 text-sm"
          >
            <div className="flex-1">
              <p className="font-semibold">
                Activity monitoring notice
              </p>

              <p className="mt-1 text-muted">
                We record paste events (size only), when you leave or return
                to this tab, and saved versions of your answers. We do not
                access your clipboard contents, camera, or microphone.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowActivityNotice(false)}
              aria-label="Dismiss activity monitoring notice"
              className="shrink-0 rounded p-1 text-muted hover:bg-surface hover:text-foreground"
            >
              ×
            </button>
          </div>
        ) : null
      }
      instructions={
        <AssignmentPanel
          instructions={assignment.instructions}
          questions={assignment.questions}
          selectedQuestionId={selectedQuestionId}
          onSelectQuestion={setSelectedQuestionId}
        />
      }
      editor={
        <AnswerPanel
          key={question.id}
          question={question}
          questionNumber={questionNumber}
          answer={answers[question.id]}
          onAnswerChange={(value) =>
            setAnswers((current) => ({
              ...current,
              [question.id]: value,
            }))
          }
          onPaste={recordPaste}
        />
      }
      aiPanel={
        // TODO(singhsaravjit): pass the real submission and attempt state once autosave lands (#6).
        <ChatPanel submissionId={null} attemptSaved={false} />
      }
      statusBar={
        <StatusBar
          question={question}
          questionNumber={questionNumber}
          questionCount={assignment.questions.length}
          currentStep={assignment.currentStep}
        />
      }
    />
  );
}
