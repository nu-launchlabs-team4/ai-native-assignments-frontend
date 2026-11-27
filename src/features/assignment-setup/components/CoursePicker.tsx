"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { ApiError, apiFetch } from "@/lib/api";
import type { CourseOut } from "@/lib/api-types";
import { API_PATHS, newAssignmentRoute, ROUTES } from "@/lib/constants";

import { SetupTopBar } from "./SetupTopBar";

type LoadState =
  | { kind: "loading" }
  | { kind: "ready"; courses: CourseOut[] }
  | { kind: "error"; message: string };

const FALLBACK_ERROR = "Couldn't load your courses.";

const LINK_CLASS =
  "flex items-center justify-between gap-3 px-4 py-3 text-body hover:bg-surface-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus pointer-coarse:min-h-11";

/**
 * The first step of "New assignment" when no course was chosen (the sidebar link): pick the
 * course, then the upload starts with it. The dashboard's per-course buttons skip this.
 */
export function CoursePicker() {
  const [state, setState] = useState<LoadState>({ kind: "loading" });

  const load = useCallback(async (): Promise<LoadState> => {
    try {
      return { kind: "ready", courses: await apiFetch<CourseOut[]>(API_PATHS.COURSES) };
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

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-8 sm:px-8 sm:py-10">
      <SetupTopBar />
      <header className="flex flex-col gap-2">
        <p className="text-callout text-muted">New assignment</p>
        <h1 className="text-large-title">Which course is this for?</h1>
      </header>
      <PickerBody state={state} onRetry={retry} />
    </main>
  );
}

function PickerBody({ state, onRetry }: { state: LoadState; onRetry: () => void }) {
  switch (state.kind) {
    case "loading":
      return (
        <>
          <p role="status" className="sr-only">
            Loading your courses…
          </p>
          <div className="h-32 rounded-xl bg-line motion-safe:animate-pulse" />
        </>
      );
    case "error":
      return (
        <div role="alert" className="flex flex-col items-start gap-3 rounded-xl border border-line bg-surface p-5">
          <p className="text-body">{state.message}</p>
          <Button variant="tinted" onClick={onRetry}>
            Try again
          </Button>
        </div>
      );
    case "ready":
      return state.courses.length === 0 ? (
        <p className="rounded-xl border border-line bg-surface p-5 text-body text-muted">
          You have no courses yet.{" "}
          <Link
            href={ROUTES.PROFESSOR}
            className="text-foreground underline underline-offset-4 hover:text-brand-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            Add a course first
          </Link>
          , then come back to set up an assignment in it.
        </p>
      ) : (
        <ul aria-label="Your courses" className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
          {state.courses.map((course) => (
            <li key={course.id}>
              <Link href={newAssignmentRoute(course.id)} className={LINK_CLASS}>
                <span className="font-medium">{course.title}</span>
                <span aria-hidden="true" className="text-muted">
                  ›
                </span>
              </Link>
            </li>
          ))}
        </ul>
      );
  }
}
