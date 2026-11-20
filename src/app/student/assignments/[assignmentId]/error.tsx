"use client";

import Link from "next/link";
import { useEffect } from "react";

import { ROUTES } from "@/lib/constants";

interface WorkspaceErrorProps {
  error: unknown;
  retry: () => void;
}

export default function WorkspaceError({ error, retry }: WorkspaceErrorProps) {
  useEffect(() => {
    // Keeps the details in the browser console for debugging. The page shows a plain message.
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-6 py-16">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        We couldn&apos;t open this assignment. Your work is not lost. Please try again.
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Try again
        </button>
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
