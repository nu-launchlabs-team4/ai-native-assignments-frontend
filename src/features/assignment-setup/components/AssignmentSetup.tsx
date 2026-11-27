"use client";

import { useId, useState } from "react";

import { ApiError } from "@/lib/api";
import { assignmentSetupRoute, MAX_ASSIGNMENT_TITLE_CHARS } from "@/lib/constants";

import { assignmentClientFor } from "../assignment-client";
import { isUnsaved } from "../new-draft";
import { draftProblem, newQuestion } from "../questions";
import type { AssignmentSettings, SetupAssignment, SetupQuestion } from "../types";
import { AssignmentSettingsForm } from "./AssignmentSettingsForm";
import { QuestionReviewList } from "./QuestionReviewList";
import { type SetupAction, SetupActions } from "./SetupActions";
import { SetupTopBar } from "./SetupTopBar";

interface AssignmentSetupProps {
  initialAssignment: SetupAssignment;
  /** The professor's PDF for a new draft, attached on the first save. */
  pdf?: File;
}

const SAVED = "Draft saved.";
const PUBLISHED = "Published. Students in this course can now see it.";
const FALLBACK_ERROR = "Something went wrong. Your edits are still here, so try again.";

const FIELD_CLASS =
  "rounded-lg border border-field bg-surface px-3 py-2 text-body text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

/** The PDF line under the title. The backend stores a path, which means nothing to the professor. */
function pdfLine(sourcePdf: string | null): string | null {
  if (!sourcePdf) return null;
  return sourcePdf.includes("/") ? "PDF attached" : `From ${sourcePdf}`;
}

/**
 * The professor's setup page for one draft assignment. Holds every edit, so the title,
 * questions and settings are saved and published together. A new draft is created on
 * the backend by its first save.
 */
export function AssignmentSetup({ initialAssignment, pdf }: AssignmentSetupProps) {
  const [assignment, setAssignment] = useState(initialAssignment);
  const [client] = useState(() => assignmentClientFor(initialAssignment));
  const [pendingPdf, setPendingPdf] = useState(pdf ?? null);
  const [pending, setPending] = useState<SetupAction | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const titleId = useId();
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

  function addQuestion() {
    edit((current) => ({ ...current, questions: [...current.questions, newQuestion(current.questions.length + 1)] }));
  }

  function removeQuestion(questionId: string) {
    edit((current) => ({
      ...current,
      questions: current.questions
        .filter((question) => question.id !== questionId)
        .map((question, index) => ({ ...question, position: index + 1 })),
    }));
  }

  function updateSettings(settings: AssignmentSettings) {
    edit((current) => ({ ...current, ...settings }));
  }

  async function createDraft(): Promise<SetupAssignment> {
    const created = await client.create(assignment);
    // From here on the draft exists, so a retry saves it instead of creating a second one,
    // and the address points at it so a reload or a bookmark finds it.
    setAssignment(created);
    window.history.replaceState(null, "", assignmentSetupRoute(created.id));
    return created;
  }

  async function attachPdf(saved: SetupAssignment, file: File): Promise<SetupAssignment> {
    try {
      const withPdf = await client.attachPdf(saved.id, file);
      setPendingPdf(null);
      return withPdf;
    } catch (caught) {
      // The draft itself is saved; only the file failed, so the next save tries it again.
      const reason = caught instanceof ApiError ? caught.message : "The upload failed.";
      throw new ApiError(
        `Draft saved, but the PDF didn't upload. ${reason} Save again to retry.`,
        caught instanceof ApiError ? caught.status : 0,
        caught instanceof ApiError ? caught.code : "pdf_upload_failed",
        null,
      );
    }
  }

  async function persist(): Promise<SetupAssignment> {
    const saved = isUnsaved(assignment) ? await createDraft() : await client.save(assignment);
    return pendingPdf ? attachPdf(saved, pendingPdf) : saved;
  }

  async function run(action: SetupAction, call: () => Promise<SetupAssignment>, done: string) {
    setNotice(null);
    const problem = draftProblem(assignment);
    if (problem) {
      setError(problem);
      return;
    }
    setPending(action);
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
        const saved = await persist();
        return client.publish(saved.id);
      },
      PUBLISHED,
    );

  const pdfText = pdfLine(assignment.source_pdf);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-8 sm:px-8 sm:py-10">
      <SetupTopBar />

      <header className="flex flex-col gap-1">
        <p className="text-callout text-muted">{published ? "Published assignment" : "Set up assignment"}</p>
        <h1 className="text-large-title">{assignment.title.trim() || "Untitled assignment"}</h1>
        {pdfText && <p className="text-callout text-muted">{pdfText}</p>}
      </header>

      <SetupActions
        pending={pending}
        published={published}
        canPublish={assignment.questions.length > 0}
        notice={notice}
        error={error}
        onSave={() => run("save", persist, SAVED)}
        onPublish={publish}
      />

      {/* A published assignment is read-only, and nothing changes mid-save. */}
      <fieldset disabled={published || pending !== null} className="m-0 min-w-0 border-0 p-0">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <label htmlFor={titleId} className="text-footnote font-semibold">
              Title
            </label>
            <input
              id={titleId}
              value={assignment.title}
              maxLength={MAX_ASSIGNMENT_TITLE_CHARS}
              onChange={(event) => edit((current) => ({ ...current, title: event.target.value }))}
              className={FIELD_CLASS}
            />
          </div>

          {/* Settings first: three choices that shape every question, kept in view above the long list. */}
          <section
            aria-labelledby="settings-heading"
            className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-5"
          >
            <h2 id="settings-heading" className="text-title">
              AI settings
            </h2>
            <AssignmentSettingsForm settings={assignment} onChange={updateSettings} />
          </section>

          <section aria-labelledby="questions-heading" className="flex flex-col gap-3">
            <h2 id="questions-heading" className="text-title">
              Questions
            </h2>
            {!published && (
              <p className="text-callout text-muted">
                {isUnsaved(assignment)
                  ? // TODO(dineshbachchani1234): drop this once backend #8 turns the PDF into questions (#4).
                    "We can't read questions from a PDF yet, so write them here. Your PDF is attached when you save."
                  : "Check the order, the text and each question's answer type before you publish."}
              </p>
            )}
            <QuestionReviewList
              questions={assignment.questions}
              onQuestionChange={updateQuestion}
              onAddQuestion={addQuestion}
              onRemoveQuestion={removeQuestion}
              readOnly={published}
            />
          </section>
        </div>
      </fieldset>
    </main>
  );
}
