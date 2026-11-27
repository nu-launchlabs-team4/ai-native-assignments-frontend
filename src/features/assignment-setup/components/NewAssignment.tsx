"use client";

import { useState } from "react";

import { MOCK_COURSE_ID } from "../mock-draft";
import { blankDraft } from "../new-draft";
import type { SetupAssignment } from "../types";
import { uploadPdf } from "../upload-pdf";
import { AssignmentSetup } from "./AssignmentSetup";
import { PdfUpload } from "./PdfUpload";
import { SetupTopBar } from "./SetupTopBar";

interface Draft {
  assignment: SetupAssignment;
  /** Set for a real course: the PDF waits in the browser until the first save. */
  pdf?: File;
}

/** Setting up a new assignment: choose the PDF, then review and save the draft. */
export function NewAssignment({ courseId }: { courseId: string }) {
  const [draft, setDraft] = useState<Draft | null>(null);
  // The sample course runs the demo parse in the browser. A real course starts an empty
  // draft, because the backend can't read questions from a PDF yet (backend #8).
  const isSample = courseId === MOCK_COURSE_ID;

  if (draft) {
    return <AssignmentSetup initialAssignment={draft.assignment} pdf={draft.pdf} />;
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-8 sm:px-8 sm:py-10">
      <SetupTopBar />
      <header className="flex flex-col gap-2">
        <p className="text-callout text-muted">Set up assignment</p>
        <h1 className="text-large-title">Upload your assignment PDF</h1>
        <p className="text-body text-muted">
          {isSample
            ? "We find each question and its answer type. You review and edit everything before students see it."
            : "Students see your PDF with the assignment. Next, you add the questions and choose the AI settings."}
        </p>
      </header>
      {isSample ? (
        <PdfUpload onUpload={async (file) => setDraft({ assignment: await uploadPdf(courseId, file) })} />
      ) : (
        <PdfUpload
          submitLabel="Continue"
          pendingLabel="Continuing…"
          pendingStatus=""
          onUpload={async (file) => setDraft({ assignment: blankDraft(courseId, file), pdf: file })}
        />
      )}
    </main>
  );
}
