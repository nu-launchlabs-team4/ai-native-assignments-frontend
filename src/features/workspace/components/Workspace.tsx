"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AppearanceControl } from "@/components/AppearanceControl";
import { type Segment, SegmentedControl } from "@/components/ui/SegmentedControl";
import { SidebarMenuButton } from "@/features/app-shell/components/SidebarMenuButton";
import { ChatPanel } from "@/features/chat/components/ChatPanel";
import type { SubmissionOut } from "@/lib/api-types";
import { Step, SubmissionStatus } from "@/lib/constants";

import type { ActivityClient } from "../activity-client";
import { attemptAnswers, isAnswered, showsRevision, toWorkspaceAssignment } from "../map-submission";
import type { SubmissionClient } from "../submission-client";
import { useActivityTracking } from "../use-activity-tracking";
import { useAnswers } from "../use-answers";
import { ActivityNotice } from "./ActivityNotice";
import { AnswerPanel } from "./AnswerPanel";
import { AssignmentPanel } from "./AssignmentPanel";
import { EvaluationPanel } from "./EvaluationPanel";
import { ExplainStepNote } from "./ExplainStepNote";
import { FinishAttemptPanel } from "./FinishAttemptPanel";
import { FinishRevisionPanel } from "./FinishRevisionPanel";
import { InterviewPanel } from "./InterviewPanel";
import { PauseButton } from "./PauseButton";
import { isResuming, ResumeBanner } from "./ResumeBanner";
import { StatusBar } from "./StatusBar";
import { StepStepper } from "./StepStepper";
import { SubmittedSummary } from "./SubmittedSummary";
import { WorkspaceShell } from "./WorkspaceShell";

type Version = "revision" | "attempt";

const VERSIONS: readonly Segment<Version>[] = [
  { value: "revision", label: "Revision" },
  { value: "attempt", label: "Original attempt" },
];

interface WorkspaceProps {
  client: SubmissionClient;
  activityClient: ActivityClient;
  initialSubmission: SubmissionOut;
}

/**
 * The student's workspace for one submission: the questions, an editor per question,
 * the AI tutor, and the panel for the current step (attempt, evaluate or revise).
 */
export function Workspace({ client, activityClient, initialSubmission }: WorkspaceProps) {
  const work = useAnswers(client, initialSubmission);
  const { submission, answers } = work;
  const assignment = useMemo(() => toWorkspaceAssignment(submission), [submission]);
  const originalAnswers = useMemo(() => attemptAnswers(submission), [submission]);
  const [selectedQuestionId, setSelectedQuestionId] = useState(assignment.questions[0].id);
  const [version, setVersion] = useState<Version>("revision");
  const submissionId = submission.id;
  const loadInterviewQuestions = useCallback(() => client.getInterviewQuestions(submissionId), [client, submissionId]);
  const [showActivityNotice, setShowActivityNotice] = useState(true);

  const step = submission.current_step;
  const isAttemptStep = step === Step.ATTEMPT;
  const isSubmitted = submission.status === SubmissionStatus.SUBMITTED;
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

  const [showResumeBanner, setShowResumeBanner] = useState(false);
  const resuming = isResuming(submission, answeredIds.size);
  // Next keeps a visited page alive and shows it again on return, so check for work in
  // progress each time the workspace is shown (when this effect runs), not on every edit.
  const resumingRef = useRef(resuming);
  useEffect(() => {
    resumingRef.current = resuming;
  }, [resuming]);
  useEffect(() => {
    setShowResumeBanner(resumingRef.current);
  }, []);

  const questionIndex = assignment.questions.findIndex((question) => question.id === selectedQuestionId);
  const question = assignment.questions[questionIndex];
  const questionNumber = questionIndex + 1;
  const shownAnswer = showingAttempt ? originalAnswers[question.id] : answers[question.id];

  const tracking = !isSubmitted;
  const { recordPaste } = useActivityTracking({
    client: activityClient,
    submissionId: submission.id,
    step,
    questionId: question.id,
    enabled: tracking,
  });

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
      <ExplainStepNote submitted={isSubmitted} />
    );

  // Step 5 closes the AI tutor: its pane holds the follow-up questions, then the summary.
  const aiPanel = isSubmitted ? (
    <SubmittedSummary
      submittedAt={submission.submitted_at}
      interviewAnswers={submission.interview_answers}
      aiDeclaration={submission.ai_declaration}
    />
  ) : step === Step.EXPLAIN ? (
    <InterviewPanel
      submissionId={submission.id}
      loadQuestions={loadInterviewQuestions}
      isSubmitting={work.isSubmitting}
      submitError={work.submitError}
      onSubmit={work.submitExplanation}
    />
  ) : (
    <ChatPanel submissionId={submission.id} attemptSaved={!isAttemptStep} />
  );

  return (
    <WorkspaceShell
      header={
        <>
          <SidebarMenuButton />
          <h1 className="truncate text-sm font-semibold">{assignment.title}</h1>
          <StepStepper currentStep={assignment.currentStep} complete={isSubmitted} />
          <div className="ml-auto flex items-center gap-3">
            {!isSubmitted && <PauseButton onSave={work.saveNow} />}
            <AppearanceControl />
          </div>
        </>
      }
      notice={
        <>
          {showResumeBanner && !isSubmitted && (
            <ResumeBanner submission={initialSubmission} onDismiss={() => setShowResumeBanner(false)} />
          )}
          {tracking && showActivityNotice && <ActivityNotice onDismiss={() => setShowActivityNotice(false)} />}
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
          onPaste={recordPaste}
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
      aiPanel={aiPanel}
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
