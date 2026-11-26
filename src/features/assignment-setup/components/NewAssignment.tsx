"use client";

import { useState } from "react";

import type { SetupAssignment } from "../types";
import { uploadPdf } from "../upload-pdf";
import { AssignmentSetup } from "./AssignmentSetup";
import { PdfUpload } from "./PdfUpload";
import { SetupTopBar } from "./SetupTopBar";

/** Setting up a new assignment: upload the PDF, then review the draft made from it. */
export function NewAssignment({ courseId }: { courseId: string }) {
  const [draft, setDraft] = useState<SetupAssignment | null>(null);

  if (draft) {
    return <AssignmentSetup initialAssignment={draft} />;
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-10">
      <SetupTopBar />
      <header className="flex flex-col gap-2">
        <p className="text-sm text-muted">Set up assignment</p>
        <h1 className="text-3xl font-semibold tracking-tight">Upload your assignment PDF</h1>
        <p className="text-muted">
          We find each question and its answer type. You review and edit everything before students see it.
        </p>
      </header>
      <PdfUpload onUpload={async (file) => setDraft(await uploadPdf(courseId, file))} />
    </main>
  );
}
