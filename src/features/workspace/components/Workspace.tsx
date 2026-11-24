"use client";

import { useMemo, useState } from "react";

import { AppearanceControl } from "@/components/AppearanceControl";
import { type Segment, SegmentedControl } from "@/components/ui/SegmentedControl";
import { ChatPanel } from "@/features/chat/components/ChatPanel";
import type { SubmissionOut } from "@/lib/api-types";
import { Step } from "@/lib/constants";

import { attemptAnswers, isAnswered, showsRevision, toWorkspaceAssignment } from "../map-submission";
import type { SubmissionClient } from "../submission-client";
import { useAnswers } from "../use-answers";
import { AnswerPanel } from "./AnswerPanel";
import { AssignmentPanel } from "./AssignmentPanel";
import { EvaluationPanel } from "./EvaluationPanel";
import { FinishAttemptPanel } from "./FinishAttemptPanel";
import { FinishRevisionPanel } from "./FinishRevisionPanel";
import { StatusBar } from "./StatusBar";
import { StepStepper } from "./StepStepper";
import { WorkspaceShell } from "./WorkspaceShell";

type Version = "revision" | "attempt";

const VERSIONS: readonly Segment<Version>[] = [
  { value: "revision", label: "Revision" },
  { value: "attempt", label: "Original attempt" },
];

interface WorkspaceProps {
  client: SubmissionClient;
  initialSubmission: SubmissionOut;
}

/** After the revision: what comes next, until step 5 is built (#8). */
function RevisionSubmitted() {
  return (
    <section aria-labelledby="revision-submitted" className="border-t border-line p-4">
      <h3 id="revision-submitted" className="text-sm font-semibold">
        Revision submitted
      </h3>
      <p role="status" className="mt-1 text-sm text-muted">
        Both versions are saved. Step 5, explaining your work, comes next.
      </p>
    </section>
  );
}

/**
 * The student's workspace for one submission: the questions, an editor per question,
 * the AI tutor, and the panel for the current step (attempt, evaluate or revise).
 */
export function Workspace({ client, initialSubmission }: WorkspaceProps) {
  const work = useAnswers(client, initialSubmission);
  const { submission, answers } = work;
  const assignment = useMemo(() => toWorkspaceAssignment(submission), [submission]);
  const originalAnswers = useMemo(() => attemptAnswers(submission), [submission]);
  const [selectedQuestionId, setSelectedQuestionId] = useState(assignment.questions[0].id);
  const [version, setVersion] = useState<Version>("revision");

  const step = submission.current_step;
  const isAttemptStep = step === Step.ATTEMPT;
  const hasRevision = showsRevision(step);
  const showingAttempt = hasRevision && version === "attempt";
  const isEditable = (step === Step.ATTEMPT || step === Step.REVISE) && !showingAttempt;

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
  const shownAnswer = showingAttempt ? originalAnswers[question.id] : answers[question.id];

  const progress = { answeredCount: answeredIds.size, questionCount: assignment.questions.length };
  const stepPanel =
    step === Step.ATTEMPT ? (
      <FinishAttemptPanel
        {...progress}
        saveStatus={work.saveStatus}
        lastSavedAt={work.lastSavedAt}
        isFinishing={work.isSubmitting}
        finishError={work.submitError}
        onFinish={work.finishAttempt}
      />
    ) : step === Step.FEEDBACK || step === Step.EVALUATE ? (
      <EvaluationPanel isSubmitting={work.isSubmitting} submitError={work.submitError} onSubmit={work.submitEvaluation} />
    ) : step === Step.REVISE ? (
      <FinishRevisionPanel
        {...progress}
        saveStatus={work.saveStatus}
        lastSavedAt={work.lastSavedAt}
        isSubmitting={work.isSubmitting}
        submitError={work.submitError}
        onFinish={work.finishRevision}
      />
    ) : (
      <RevisionSubmitted />
    );

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
          footer={stepPanel}
        />
      }
      editor={
        <AnswerPanel
          // A new key per question, step and version gives a fresh editor that starts from the
          // right answer, and remounts it read-only when the step or the version changes.
          key={`${question.id}-${step}-${version}`}
          question={question}
          questionNumber={questionNumber}
          answer={shownAnswer}
          onAnswerChange={(value) => work.setAnswer(question.id, value)}
          readOnly={!isEditable}
          toolbar={
            hasRevision && (
              <SegmentedControl
                legend="Which version to show"
                hideLegend
                segments={VERSIONS}
                value={version}
                onChange={setVersion}
                className="max-w-xs"
              />
            )
          }
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
