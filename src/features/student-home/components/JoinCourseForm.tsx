"use client";

import { type FormEvent, useId, useState } from "react";

import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { ApiError } from "@/lib/api";
import type { EnrollmentOut } from "@/lib/api-types";

// The backend's limits (JoinCourseIn): generous, since students may type spaces.
const MIN_CODE_LENGTH = 4;
const MAX_CODE_LENGTH = 32;
const FALLBACK_ERROR = "Couldn't join the course. Try again.";

interface JoinCourseFormProps {
  /** Joins the course. Throws if the backend refuses the code. */
  onJoin: (code: string) => Promise<EnrollmentOut>;
}

/** One field for the code the professor gave out, such as 7K4Q-M2XP. */
export function JoinCourseForm({ onJoin }: JoinCourseFormProps) {
  const inputId = useId();
  const errorId = useId();
  const [code, setCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = code.trim();
    setJoined(null);
    if (trimmed.length < MIN_CODE_LENGTH) {
      setError("Enter the code from your professor, such as 7K4Q-M2XP.");
      return;
    }
    setJoining(true);
    setError(null);
    try {
      const enrollment = await onJoin(trimmed);
      setCode("");
      setJoined(enrollment.course_title);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : FALLBACK_ERROR);
    } finally {
      setJoining(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-callout font-medium">
        Join a course
      </label>
      <div className="flex flex-wrap gap-2">
        <input
          id={inputId}
          value={code}
          maxLength={MAX_CODE_LENGTH}
          placeholder="7K4Q-M2XP"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          disabled={joining}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => {
            setCode(event.target.value);
            setError(null);
          }}
          className={`min-w-0 flex-1 rounded-md border bg-surface px-3 py-2 font-mono text-body uppercase tracking-wider placeholder:normal-case placeholder:tracking-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus pointer-coarse:min-h-11 ${error ? "border-danger" : "border-field"}`}
        />
        <Button type="submit" variant="tinted" disabled={joining}>
          {joining ? "Joining…" : "Join"}
        </Button>
      </div>
      {error && (
        <ErrorMessage id={errorId} role="alert" className="text-callout font-medium">
          {error}
        </ErrorMessage>
      )}
      <p role="status" className="text-callout text-muted">
        {joined && `Joined ${joined}. Its assignments are below.`}
      </p>
    </form>
  );
}
