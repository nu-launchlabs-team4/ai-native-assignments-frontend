"use client";

import { useMemo, useState } from "react";

import { AppearanceControl } from "@/components/AppearanceControl";
import { ChatPanel } from "@/features/chat/components/ChatPanel";
import type { SubmissionOut } from "@/lib/api-types";
import { Step } from "@/lib/constants";

import { isAnswered, toWorkspaceAssignment } from "../map-submission";
import type { SubmissionClient } from "../submission-client";
import { useAttempt } from "../use-attempt";
import { AnswerPanel } from "./AnswerPanel";
import { AssignmentPanel } from "./AssignmentPanel";
import { FinishAttemptPanel } from "./FinishAttemptPanel";
import { StatusBar } from "./StatusBar";
import { StepStepper } from "./StepStepper";
import { WorkspaceShell } from "./WorkspaceShell";

interface WorkspaceProps {
  client: SubmissionClient;
  initialSubmission: SubmissionOut;
}

/**
 * The student's workspace for one submission: the questions, an editor per
 * question, the finish-attempt form and the AI tutor.
 */
export function Workspace({ client, initialSubmission }: WorkspaceProps) {
  const attempt = useAttempt(client, initialSubmission);
  const { submission, answers } = attempt;
  const assignment = useMemo(() => toWorkspaceAssignment(submission), [submission]);
  const [selectedQuestionId, setSelectedQuestionId] = useState(assignment.questions[0].id);

  const isAttemptStep = submission.current_step === Step.ATTEMPT;
  const answeredIds = useMemo(
    () =>
      new Set(
        assignment.questions
          .filter((question) => isAnswered(answers[question.id], question.starterAnswer))
          .map((question) => question.id),
      ),
    [answers, assignment.questions],
  );

  const questionIndex = assignment.questions.findIndex((question) => question.id === selectedQuestionId);
  const question = assignment.questions[questionIndex];
  const questionNumber = questionIndex + 1;

  return (
    <WorkspaceShell
      header={
        <>
          <h1 className="truncate text-sm font-semibold">{assignment.title}</h1>
          <StepStepper currentStep={assignment.currentStep} />
          <div className="ml-auto">
            <AppearanceControl />
          </div>
        </>
      }
      instructions={
        <AssignmentPanel
          instructions={assignment.instructions}
          questions={assignment.questions}
          selectedQuestionId={selectedQuestionId}
          answeredIds={answeredIds}
          onSelectQuestion={setSelectedQuestionId}
          footer={
            <FinishAttemptPanel
              answeredCount={answeredIds.size}
              questionCount={assignment.questions.length}
              isAttemptStep={isAttemptStep}
              saveStatus={attempt.saveStatus}
              lastSavedAt={attempt.lastSavedAt}
              isFinishing={attempt.isFinishing}
              finishError={attempt.finishError}
              onFinish={attempt.finish}
            />
          }
        />
      }
      editor={
        <AnswerPanel
          // A new key per question gives each one a fresh editor that starts from its saved answer.
          // The step is in the key too, so editors remount read-only once the attempt is submitted.
          key={`${question.id}-${isAttemptStep}`}
          question={question}
          questionNumber={questionNumber}
          answer={answers[question.id]}
          onAnswerChange={(value) => attempt.setAnswer(question.id, value)}
          readOnly={!isAttemptStep}
        />
      }
      aiPanel={<ChatPanel submissionId={submission.id} attemptSaved={!isAttemptStep} />}
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
