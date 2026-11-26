"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api";

import { createCourse, type DashboardCourse, loadCourses } from "../dashboard-client";
import { CourseCard } from "./CourseCard";
import { NewCourseForm } from "./NewCourseForm";

type LoadState =
  | { kind: "loading" }
  | { kind: "ready"; courses: DashboardCourse[] }
  | { kind: "error"; message: string };

const FALLBACK_ERROR = "Couldn't load your courses.";

// Loaded in the browser: server-side calls can't send the session cookie yet (#3).
/** The professor's home: their courses and assignments, and a form to add a course. */
export function ProfessorDashboard() {
  const [state, setState] = useState<LoadState>({ kind: "loading" });

  const load = useCallback(async (): Promise<LoadState> => {
    try {
      return { kind: "ready", courses: await loadCourses() };
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

  async function addCourse(title: string) {
    const course = await createCourse(title);
    setState((current) => (current.kind === "ready" ? { ...current, courses: [...current.courses, course] } : current));
  }

  return (
    <div className="flex flex-col gap-6">
      {state.kind === "ready" && <NewCourseForm onCreate={addCourse} />}
      <DashboardBody state={state} onRetry={retry} />
    </div>
  );
}

function DashboardBody({ state, onRetry }: { state: LoadState; onRetry: () => void }) {
  switch (state.kind) {
    case "loading":
      return (
        <div className="flex flex-col gap-4">
          <p role="status" className="sr-only">
            Loading your courses…
          </p>
          <div className="h-32 rounded-lg bg-line motion-safe:animate-pulse" />
          <div className="h-32 rounded-lg bg-line motion-safe:animate-pulse" />
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
      return state.courses.length === 0 ? (
        <p className="rounded-lg border border-line bg-surface p-4 text-body text-muted">
          You have no courses yet. Add one above, then upload an assignment PDF into it.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {state.courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      );
  }
}
