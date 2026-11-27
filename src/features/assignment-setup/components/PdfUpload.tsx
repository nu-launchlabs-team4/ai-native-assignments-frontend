"use client";

import { type DragEvent, type FormEvent, useId, useState } from "react";

import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api";
import { MAX_PDF_MB } from "@/lib/constants";

import { formatFileSize, pdfProblem } from "../pdf";

const FALLBACK_ERROR = "Something went wrong reading this PDF. Try again.";

interface PdfUploadProps {
  /** Uploads the file and moves on to the review. Throws if the upload fails. */
  onUpload: (file: File) => Promise<void>;
  /** The button, and what it and the status line say while `onUpload` runs. */
  submitLabel?: string;
  pendingLabel?: string;
  pendingStatus?: string;
}

/** Choose or drop the assignment PDF, then hand it on with `onUpload`. */
export function PdfUpload({
  onUpload,
  submitLabel = "Turn into questions",
  pendingLabel = "Reading your PDF…",
  pendingStatus = "Finding each question and its answer type. This can take a minute.",
}: PdfUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputId = useId();
  const hintId = useId();

  function choose(next: File | undefined) {
    if (!next) {
      return;
    }
    const problem = pdfProblem(next);
    setError(problem);
    setFile(problem ? null : next);
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    if (!uploading) {
      choose(event.dataTransfer.files[0]);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setError("Choose a PDF first.");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      await onUpload(file);
    } catch (uploadError) {
      setError(uploadError instanceof ApiError ? uploadError.message : FALLBACK_ERROR);
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} aria-busy={uploading} className="flex flex-col gap-4">
      <label
        htmlFor={inputId}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed px-6 py-12 text-center focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus ${
          dragging ? "border-accent bg-accent-soft" : "border-field bg-surface"
        }`}
      >
        <span className="text-headline">Choose a PDF or drag it here</span>
        <input
          id={inputId}
          type="file"
          accept="application/pdf,.pdf"
          aria-describedby={hintId}
          disabled={uploading}
          className="sr-only"
          onChange={(event) => {
            choose(event.target.files?.[0]);
            // Lets the professor pick the same file again after fixing it.
            event.target.value = "";
          }}
        />
      </label>
      <p id={hintId} className="-mt-2 text-center text-footnote text-muted">
        Your assignment instructions as a PDF, up to {MAX_PDF_MB} MB.
      </p>

      {file && (
        <p className="text-callout">
          <span className="font-medium">Selected:</span> {file.name} ({formatFileSize(file.size)})
        </p>
      )}
      {error && (
        <p role="alert" className="text-callout font-medium text-danger">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={uploading}>
          {uploading ? pendingLabel : submitLabel}
        </Button>
        <p role="status" className="text-callout text-muted">
          {uploading ? pendingStatus : ""}
        </p>
      </div>
    </form>
  );
}
