"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { MOCK_ASSIGNMENT_ID } from "@/features/workspace/mock-assignment";
import { ApiError } from "@/lib/api";
import type { StudentAssignmentOut } from "@/lib/api-types";
import { studentAssignmentRoute } from "@/lib/constants";

import { joinCourse, loadStudentAssignments } from "../student-client";
import { JoinCourseForm } from "./JoinCourseForm";
import { StudentAssignmentList } from "./StudentAssignmentList";

type LoadState =
  | { kind: "loading" }
  | { kind: "ready"; assignments: StudentAssignmentOut[] }
  | { kind: "error"; message: string };

const FALLBACK_ERROR = "Couldn't load your assignments.";

// Loaded in the browser: server-side calls can't send the session cookie yet (#3).
/** The student's home: a form to join a course, and the assignments from the courses they joined. */
export function StudentHome() {
  const [state, setState] = useState<LoadState>({ kind: "loading" });

  const load = useCallback(async (): Promise<LoadState> => {
    try {
      return { kind: "ready", assignments: await loadStudentAssignments() };
    } catch (caught) {
      return { kind: "error", message: caught instanceof ApiError ? caught.message : FALLBACK_ERROR };
    }
  }, []);

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

  async function join(code: string) {
    const enrollment = await joinCourse(code);
    // The new course's assignments join the list.
    setState(await load());
    return enrollment;
  }

  return (
    <div className="flex flex-col gap-6">
      <JoinCourseForm onJoin={join} />
      <HomeBody state={state} onRetry={retry} />
    </div>
  );
}

function SampleLink() {
  return (
    <Link
      href={studentAssignmentRoute(MOCK_ASSIGNMENT_ID)}
      className="text-foreground underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
    >
      Try the sample assignment
    </Link>
  );
}

function HomeBody({ state, onRetry }: { state: LoadState; onRetry: () => void }) {
  switch (state.kind) {
    case "loading":
      return (
        <div className="flex flex-col gap-3">
          <p role="status" className="sr-only">
            Loading your assignments…
          </p>
          <div className="h-16 rounded-lg bg-line motion-safe:animate-pulse" />
          <div className="h-16 rounded-lg bg-line motion-safe:animate-pulse" />
        </div>
      );
    case "error":
      return (
        <div role="alert" className="flex flex-col items-start gap-3 rounded-lg border border-line bg-surface p-4">
          <p className="text-body">{state.message}</p>
          <Button variant="tinted" onClick={onRetry}>
            Try again
          </Button>
        </div>
      );
    case "ready":
      return state.assignments.length === 0 ? (
        <div className="flex flex-col gap-2 rounded-lg border border-line bg-surface p-4">
          <p className="text-body">Join a course with the code from your professor.</p>
          <p className="text-callout text-muted">
            Its assignments show up here once they&apos;re published. Meanwhile, <SampleLink /> to see how the five
            steps work.
          </p>
        </div>
      ) : (
        <section aria-labelledby="student-assignments" className="flex flex-col gap-2">
          <h2 id="student-assignments" className="text-headline">
            Your assignments
          </h2>
          <StudentAssignmentList assignments={state.assignments} />
          <p className="text-callout text-muted">
            New to the five steps? <SampleLink />.
          </p>
        </section>
      );
  }
}
