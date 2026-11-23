"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Button, buttonClassName } from "@/components/ui/Button";
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
      <p className="text-muted">
        We couldn&apos;t open this assignment. Your work is not lost. Please try again.
      </p>
      <div className="flex gap-3">
        <Button onClick={() => retry()}>Try again</Button>
        <Link href={ROUTES.STUDENT} className={buttonClassName({ variant: "plain" })}>
          Back to assignments
        </Link>
      </div>
    </main>
  );
}
