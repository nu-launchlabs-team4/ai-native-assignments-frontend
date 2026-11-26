"use client";

import { type FormEvent, useId, useState } from "react";

import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api";

const MAX_TITLE_LENGTH = 200; // The backend's limit (CourseCreate).
const FALLBACK_ERROR = "Couldn't add the course. Try again.";

interface NewCourseFormProps {
  /** Creates the course. Throws if the backend refuses it. */
  onCreate: (title: string) => Promise<void>;
}

/** A one-field form that adds a course. */
export function NewCourseForm({ onCreate }: NewCourseFormProps) {
  const inputId = useId();
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Give the course a title.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onCreate(trimmed);
      setTitle("");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : FALLBACK_ERROR);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-callout font-medium">
        New course
      </label>
      <div className="flex flex-wrap gap-2">
        <input
          id={inputId}
          value={title}
          maxLength={MAX_TITLE_LENGTH}
          placeholder="Intro to Programming"
          disabled={saving}
          onChange={(event) => setTitle(event.target.value)}
          className="min-w-0 flex-1 rounded-md border border-field bg-surface px-3 py-2 text-body focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus pointer-coarse:min-h-11"
        />
        <Button type="submit" variant="tinted" disabled={saving}>
          {saving ? "Adding…" : "Add course"}
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-callout font-medium text-danger">
          {error}
        </p>
      )}
    </form>
  );
}
