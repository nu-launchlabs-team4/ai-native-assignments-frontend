"use client";

import { useState } from "react";

import { ApiError } from "@/lib/api";

import { assignmentClientFor } from "../assignment-client";
import type { AssignmentSettings, SetupAssignment, SetupQuestion } from "../types";
import { AssignmentSettingsForm } from "./AssignmentSettingsForm";
import { QuestionReviewList } from "./QuestionReviewList";
import { type SetupAction, SetupActions } from "./SetupActions";
import { SetupTopBar } from "./SetupTopBar";

interface AssignmentSetupProps {
  initialAssignment: SetupAssignment;
}

const SAVED = "Draft saved.";
const PUBLISHED = "Published. Students in this course can now see it.";
const FALLBACK_ERROR = "Something went wrong. Your edits are still here, so try again.";

/**
 * The professor's setup page for one draft assignment. Holds every edit, so the
 * questions and settings can be saved and published together.
 */
export function AssignmentSetup({ initialAssignment }: AssignmentSetupProps) {
  const [assignment, setAssignment] = useState(initialAssignment);
  const [client] = useState(() => assignmentClientFor(initialAssignment));
  const [pending, setPending] = useState<SetupAction | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const published = assignment.published_at !== null;

  function edit(change: (current: SetupAssignment) => SetupAssignment) {
    setAssignment(change);
    setNotice(null);
  }

  function updateQuestion(updated: SetupQuestion) {
    edit((current) => ({
      ...current,
      questions: current.questions.map((question) => (question.id === updated.id ? updated : question)),
    }));
  }

  function updateSettings(settings: AssignmentSettings) {
    edit((current) => ({ ...current, ...settings }));
  }

  async function run(action: SetupAction, call: () => Promise<SetupAssignment>, done: string) {
    setPending(action);
    setNotice(null);
    setError(null);
    try {
      setAssignment(await call());
      setNotice(done);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : FALLBACK_ERROR);
    } finally {
      setPending(null);
    }
  }

  // Publishing saves first, so the latest edits are what students see.
  const publish = () =>
    run(
      "publish",
      async () => {
        await client.save(assignment);
        return client.publish(assignment.id);
      },
      PUBLISHED,
    );

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-10">
      <SetupTopBar />

      <header className="flex flex-col gap-1">
        <p className="text-sm text-muted">{published ? "Published assignment" : "Set up assignment"}</p>
        <h1 className="text-3xl font-semibold tracking-tight">{assignment.title}</h1>
        {assignment.source_pdf && <p className="text-sm text-muted">From {assignment.source_pdf}</p>}
      </header>

      <SetupActions
        pending={pending}
        published={published}
        canPublish={assignment.questions.length > 0}
        notice={notice}
        error={error}
        onSave={() => run("save", () => client.save(assignment), SAVED)}
        onPublish={publish}
      />

      {/* A published assignment is read-only, and nothing changes mid-save. */}
      <fieldset disabled={published || pending !== null} className="m-0 min-w-0 border-0 p-0">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <section aria-labelledby="questions-heading" className="flex flex-col gap-3">
            <h2 id="questions-heading" className="text-lg font-semibold">
              Review questions
            </h2>
            {!published && (
              <p className="text-sm text-muted">
                Check the order, the text and each question&apos;s answer type before you publish.
              </p>
            )}
            <QuestionReviewList questions={assignment.questions} onQuestionChange={updateQuestion} />
          </section>

          <section aria-labelledby="settings-heading" className="flex flex-col gap-3">
            <h2 id="settings-heading" className="text-lg font-semibold">
              AI settings
            </h2>
            <AssignmentSettingsForm settings={assignment} onChange={updateSettings} />
          </section>
        </div>
      </fieldset>
    </main>
  );
}
