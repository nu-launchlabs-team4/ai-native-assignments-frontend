"use client";

import Link from "next/link";
import { type ReactNode, useCallback, useEffect, useState } from "react";

import { ApiError } from "@/lib/api";
import type { SubmissionOut } from "@/lib/api-types";
import { ROUTES } from "@/lib/constants";

import { submissionClientFor } from "../submission-client";
import { Workspace } from "./Workspace";
import { WorkspaceSkeleton } from "./WorkspaceSkeleton";

type LoadState =
  | { kind: "loading" }
  | { kind: "ready"; submission: SubmissionOut }
  | { kind: "not-found" }
  | { kind: "error"; message: string };

interface WorkspaceLoaderProps {
  assignmentId: string;
}

/** Starts (or resumes) the student's submission, then shows the workspace. */
export function WorkspaceLoader({ assignmentId }: WorkspaceLoaderProps) {
  const client = submissionClientFor(assignmentId);
  const [state, setState] = useState<LoadState>({ kind: "loading" });

  const load = useCallback(async (): Promise<LoadState> => {
    try {
      return { kind: "ready", submission: await client.start(assignmentId) };
    } catch (error) {
      // 404: no such published assignment. 422: the id isn't a valid assignment id.
      if (error instanceof ApiError && (error.status === 404 || error.status === 422)) {
        return { kind: "not-found" };
      }
      return { kind: "error", message: error instanceof Error ? error.message : String(error) };
    }
  }, [assignmentId, client]);

  useEffect(() => {
    let cancelled = false;
    load().then((next) => {
      if (!cancelled) setState(next);
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  async function retry() {
    setState({ kind: "loading" });
    setState(await load());
  }

  switch (state.kind) {
    case "loading":
      return <WorkspaceSkeleton />;
    case "ready":
      return <Workspace client={client} initialSubmission={state.submission} />;
    case "not-found":
      return (
        <LoadMessage title="Assignment not found">
          This assignment doesn&apos;t exist, isn&apos;t published yet, or you don&apos;t have access to it.
        </LoadMessage>
      );
    case "error":
      return (
        <LoadMessage title="Couldn't open this assignment" onRetry={retry}>
          {state.message}
        </LoadMessage>
      );
  }
}

function LoadMessage({
  title,
  children,
  onRetry,
}: {
  title: string;
  children: ReactNode;
  onRetry?: () => void;
}) {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-6 py-16">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-muted">{children}</p>
      <div className="flex gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Try again
          </button>
        )}
        <Link
          href={ROUTES.STUDENT}
          className="rounded-md px-4 py-2 text-sm font-medium underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Back to assignments
        </Link>
      </div>
    </main>
  );
}
