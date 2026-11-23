"use client";

import { useState } from "react";

import type { AssignmentSettings, SetupAssignment, SetupQuestion } from "../types";
import { AssignmentSettingsForm } from "./AssignmentSettingsForm";
import { QuestionReviewList } from "./QuestionReviewList";
import { SetupTopBar } from "./SetupTopBar";

interface AssignmentSetupProps {
  initialAssignment: SetupAssignment;
}

/**
 * The professor's setup page for one draft assignment. Holds every edit, so the
 * questions and settings can be saved and published together.
 */
// TODO(dineshbachchani1234): add save and publish once the backend endpoints exist (#4).
export function AssignmentSetup({ initialAssignment }: AssignmentSetupProps) {
  const [assignment, setAssignment] = useState(initialAssignment);

  function updateQuestion(updated: SetupQuestion) {
    setAssignment((current) => ({
      ...current,
      questions: current.questions.map((question) => (question.id === updated.id ? updated : question)),
    }));
  }

  function updateSettings(settings: AssignmentSettings) {
    setAssignment((current) => ({ ...current, ...settings }));
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-10">
      <SetupTopBar />

      <header className="flex flex-col gap-1">
        <p className="text-sm text-muted">Set up assignment</p>
        <h1 className="text-3xl font-semibold tracking-tight">{assignment.title}</h1>
        {assignment.source_pdf && <p className="text-sm text-muted">From {assignment.source_pdf}</p>}
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section aria-labelledby="questions-heading" className="flex flex-col gap-3">
          <h2 id="questions-heading" className="text-lg font-semibold">
            Review questions
          </h2>
          <p className="text-sm text-muted">
            Check the order, the text and each question&apos;s answer type before you publish.
          </p>
          <QuestionReviewList questions={assignment.questions} onQuestionChange={updateQuestion} />
        </section>

        <section aria-labelledby="settings-heading" className="flex flex-col gap-3">
          <h2 id="settings-heading" className="text-lg font-semibold">
            AI settings
          </h2>
          <AssignmentSettingsForm settings={assignment} onChange={updateSettings} />
        </section>
      </div>
    </main>
  );
}
