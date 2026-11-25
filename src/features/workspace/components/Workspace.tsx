
"use client";

import { useCallback, useState } from "react";

import { ThemeToggle } from "@/components/ThemeToggle";
import { ChatPanel } from "@/features/chat/components/ChatPanel";

import type { Answers, WorkspaceAssignment } from "../types";
import {
  useActivityTracking,
  type ActivityEvent,
} from "../hooks/useActivityTracking";
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

/**
 * The student's workspace for one assignment. Holds which question is open and
 * every answer, so switching questions never loses work.
 */
// TODO(akashshetty1997): save answers to the backend with autosave (#6).
export function Workspace({ assignment }: WorkspaceProps) {
  const [selectedQuestionId, setSelectedQuestionId] = useState(
    assignment.questions[0].id,
  );

  const [answers, setAnswers] = useState<Answers>(() =>
    initialAnswers(assignment),
  );

  const [showActivityNotice, setShowActivityNotice] = useState(true);

  const questionIndex = assignment.questions.findIndex(
    (question) => question.id === selectedQuestionId,
  );

  const question = assignment.questions[questionIndex];
  const questionNumber = questionIndex + 1;

  const handleActivity = useCallback((event: ActivityEvent) => {
    console.log("Activity detected:", event);
  }, []);

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
                During this assignment, we record paste events and when you
                switch away from or return to this tab. We record event
                timestamps and relevant question IDs. We do not access your
                clipboard contents, camera, or microphone.
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
