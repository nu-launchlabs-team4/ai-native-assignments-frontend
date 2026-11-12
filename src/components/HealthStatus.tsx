"use client";

import { useCallback, useEffect, useState } from "react";

import { ApiError, apiFetch } from "@/lib/api";
import { API_PATHS } from "@/lib/constants";

interface HealthResponse {
  status: string;
  db: string;
}

type ConnectionState = "checking" | "connected" | "unreachable" | "unknown";

interface HealthResult {
  api: ConnectionState;
  database: ConnectionState;
  detail: string | null;
}

const CHECKING: HealthResult = { api: "checking", database: "checking", detail: null };

const BACKEND_DOWN_DETAIL =
  "The backend did not answer. Check that it is running and that NEXT_PUBLIC_API_URL points to it.";

const STATE_LABEL: Record<ConnectionState, string> = {
  checking: "Checking…",
  connected: "Connected",
  unreachable: "Unreachable",
  unknown: "Unknown",
};

const STATE_STYLE: Record<ConnectionState, string> = {
  checking: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  connected: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  unreachable: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  unknown: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
};

async function checkHealth(): Promise<HealthResult> {
  try {
    await apiFetch<HealthResponse>(API_PATHS.HEALTH);
    return { api: "connected", database: "connected", detail: null };
  } catch (error) {
    // /health answers 503 when the API is up but cannot reach the database.
    if (error instanceof ApiError && error.status === 503) {
      return { api: "connected", database: "unreachable", detail: null };
    }
    // Any other failure means the /api rewrite could not get an answer from the backend.
    return { api: "unreachable", database: "unknown", detail: BACKEND_DOWN_DETAIL };
  }
}

/** Checks the backend /health endpoint from the browser and shows the result. */
export function HealthStatus() {
  const [result, setResult] = useState<HealthResult>(CHECKING);

  const runCheck = useCallback(async () => {
    setResult(CHECKING);
    setResult(await checkHealth());
  }, []);

  useEffect(() => {
    let cancelled = false;
    checkHealth().then((health) => {
      if (!cancelled) {
        setResult(health);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const isChecking = result.api === "checking";

  return (
    <section aria-labelledby="health-heading" className="flex flex-col gap-4">
      <h2 id="health-heading" className="sr-only">
        Backend health
      </h2>
      <dl role="status" aria-live="polite" className="flex flex-col gap-3">
        <StatusRow label="API" state={result.api} />
        <StatusRow label="Database" state={result.database} />
      </dl>
      {result.detail && <p className="text-sm text-red-700 dark:text-red-300">{result.detail}</p>}
      <button
        type="button"
        onClick={runCheck}
        disabled={isChecking}
        className="self-start rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        Check again
      </button>
    </section>
  );
}

function StatusRow({ label, state }: { label: string; state: ConnectionState }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800">
      <dt className="font-medium">{label}</dt>
      <dd className={`rounded-full px-3 py-1 text-sm ${STATE_STYLE[state]}`}>{STATE_LABEL[state]}</dd>
    </div>
  );
}
