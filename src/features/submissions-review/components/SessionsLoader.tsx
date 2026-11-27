"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { ApiError, apiFetch } from "@/lib/api";
import { API_PATHS, ROUTES, submissionSummaryRoute } from "@/lib/constants";

import { getMockSessions } from "../mock-sessions";
import type { SubmissionSessions } from "../session-types";
import { ReviewLayout } from "./ReviewLayout";
import { ReviewLoading } from "./ReviewLoading";
import { SessionTimeline } from "./SessionTimeline";

type LoadState =
  | { kind: "loading" }
  | { kind: "ready"; data: SubmissionSessions }
  | { kind: "not-found" }
  | { kind: "error"; message: string };

const FALLBACK_ERROR = "Couldn't load the work sessions.";

function fetchSessions(submissionId: string): Promise<SubmissionSessions> {
  const sample = getMockSessions(submissionId);
  if (sample) return Promise.resolve(sample);
  return apiFetch<SubmissionSessions>(
    `${API_PATHS.SUBMISSIONS}/${encodeURIComponent(submissionId)}${API_PATHS.SESSIONS}`,
  );
}

/** Loads a submission's work sessions in the browser (backend #14), then shows the timeline. */
export function SessionsLoader({ submissionId }: { submissionId: string }) {
  const [state, setState] = useState<LoadState>({ kind: "loading" });

  const load = useCallback(async (): Promise<LoadState> => {
    try {
      return { kind: "ready", data: await fetchSessions(submissionId) };
    } catch (caught) {
      // 404: not a submission to this professor's assignments. 422: not a valid id.
      if (caught instanceof ApiError && (caught.status === 404 || caught.status === 422)) {
        return { kind: "not-found" };
      }
      return { kind: "error", message: caught instanceof ApiError ? caught.message : FALLBACK_ERROR };
    }
  }, [submissionId]);

  useEffect(() => {
    let cancelled = false;
    load().then((next) => {
      if (!cancelled) setState(next);
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  if (state.kind === "loading") {
    return <ReviewLoading />;
  }

  if (state.kind === "ready") {
    const { data } = state;
    return (
      <ReviewLayout
        backHref={submissionSummaryRoute(data.submission_id)}
        backLabel="Reasoning summary"
        eyebrow={`Work sessions · ${data.assignment_title}`}
        title={data.student_name}
      >
        <SessionTimeline sessions={data.sessions} />
      </ReviewLayout>
    );
  }

  if (state.kind === "not-found") {
    return (
      <ReviewLayout backHref={ROUTES.PROFESSOR} backLabel="Professor dashboard" eyebrow="Work sessions" title="Submission not found">
        <p className="text-body text-muted">It may have been deleted, or it belongs to another professor&apos;s course.</p>
      </ReviewLayout>
    );
  }

  return (
    <ReviewLayout backHref={ROUTES.PROFESSOR} backLabel="Professor dashboard" eyebrow="Work sessions" title="Work sessions">
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
    </ReviewLayout>
  );
}
