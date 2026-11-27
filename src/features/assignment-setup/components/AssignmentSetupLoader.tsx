"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { ApiError, apiFetch } from "@/lib/api";
import { API_PATHS, ROUTES } from "@/lib/constants";

import { MOCK_DRAFT } from "../mock-draft";
import type { SetupAssignment } from "../types";
import { AssignmentSetup } from "./AssignmentSetup";

type LoadState =
  | { kind: "loading" }
  | { kind: "ready"; assignment: SetupAssignment }
  | { kind: "not-found" }
  | { kind: "error"; message: string };

const FALLBACK_ERROR = "Couldn't load this assignment.";

function fetchAssignment(assignmentId: string): Promise<SetupAssignment> {
  if (assignmentId === MOCK_DRAFT.id) return Promise.resolve(MOCK_DRAFT);
  return apiFetch<SetupAssignment>(`${API_PATHS.ASSIGNMENTS}/${encodeURIComponent(assignmentId)}`);
}

/** Loads one of the professor's assignments in the browser, then shows its setup page. */
export function AssignmentSetupLoader({ assignmentId }: { assignmentId: string }) {
  const [state, setState] = useState<LoadState>({ kind: "loading" });

  const load = useCallback(async (): Promise<LoadState> => {
    try {
      return { kind: "ready", assignment: await fetchAssignment(assignmentId) };
    } catch (caught) {
      // 404: not this professor's assignment. 422: not a valid id.
      if (caught instanceof ApiError && (caught.status === 404 || caught.status === 422)) {
        return { kind: "not-found" };
      }
      return { kind: "error", message: caught instanceof ApiError ? caught.message : FALLBACK_ERROR };
    }
  }, [assignmentId]);

  useEffect(() => {
    let cancelled = false;
    load().then((next) => {
      if (!cancelled) setState(next);
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  if (state.kind === "ready") {
    return <AssignmentSetup initialAssignment={state.assignment} />;
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-10">
      {state.kind === "loading" && (
        <>
          <p role="status" className="sr-only">
            Loading the assignment…
          </p>
          <div className="h-8 w-72 rounded-lg bg-line motion-safe:animate-pulse" />
          <div className="h-48 rounded-xl bg-line motion-safe:animate-pulse" />
        </>
      )}
      {state.kind === "not-found" && (
        <>
          <h1 className="text-title">Assignment not found</h1>
          <p className="text-body text-muted">It may have been deleted, or it belongs to another professor.</p>
        </>
      )}
      {state.kind === "error" && (
        <div role="alert" className="flex flex-col items-start gap-3">
          <p className="text-body">{state.message}</p>
          <Button
            variant="tinted"
            onClick={async () => {
              setState({ kind: "loading" });
              setState(await load());
            }}
          >
            Try again
          </Button>
        </div>
      )}
      {state.kind !== "loading" && (
        <Link
          href={ROUTES.PROFESSOR}
          className="text-callout text-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          ← Professor dashboard
        </Link>
      )}
    </main>
  );
}
