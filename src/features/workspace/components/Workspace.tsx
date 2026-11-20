"use client";

import { useState } from "react";

import { ThemeToggle } from "@/components/ThemeToggle";
import { ChatPanel } from "@/features/chat/components/ChatPanel";

import type { Answers, WorkspaceAssignment } from "../types";
import { AnswerPanel } from "./AnswerPanel";
import { AssignmentPanel } from "./AssignmentPanel";
import { StatusBar } from "./StatusBar";
import { StepStepper } from "./StepStepper";
import { WorkspaceShell } from "./WorkspaceShell";

interface WorkspaceProps {
  assignment: WorkspaceAssignment;
}

function initialAnswers(assignment: WorkspaceAssignment): Answers {
  return Object.fromEntries(assignment.questions.map((question) => [question.id, question.starterAnswer]));
}

/**
 * The student's workspace for one assignment. Holds which question is open and
 * every answer, so switching questions never loses work.
 */
// TODO(akashshetty1997): save answers to the backend with autosave (#6).
export function Workspace({ assignment }: WorkspaceProps) {
  const [selectedQuestionId, setSelectedQuestionId] = useState(assignment.questions[0].id);
  const [answers, setAnswers] = useState<Answers>(() => initialAnswers(assignment));

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
            <ThemeToggle />
          </div>
        </>
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
          // A new key per question gives each one a fresh editor that starts from its saved answer.
          key={question.id}
          question={question}
          questionNumber={questionNumber}
          answer={answers[question.id]}
          onAnswerChange={(value) => setAnswers((current) => ({ ...current, [question.id]: value }))}
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
