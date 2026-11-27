"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";

type CopyState = "idle" | "copied" | "failed";

const RESET_AFTER_MS = 2000;

/** A course's join code, shown large enough to read aloud, with a button that copies it. */
export function JoinCode({ code, courseTitle }: { code: string; courseTitle: string }) {
  const [copy, setCopy] = useState<CopyState>("idle");

  useEffect(() => {
    if (copy !== "copied") return;
    const timer = setTimeout(() => setCopy("idle"), RESET_AFTER_MS);
    return () => clearTimeout(timer);
  }, [copy]);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopy("copied");
    } catch {
      // Clipboard access can be blocked (permissions, an insecure origin); the code stays selectable.
      setCopy("failed");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <span className="text-callout text-muted">Join code</span>
      <code className="select-all font-mono text-headline tracking-wider">{code}</code>
      <Button variant="tinted" size="small" onClick={copyCode} aria-label={`Copy join code for ${courseTitle}`}>
        {copy === "copied" ? "Copied" : "Copy"}
      </Button>
      <span role="status" className="text-footnote text-muted">
        {copy === "copied" && <span className="sr-only">Join code copied.</span>}
        {copy === "failed" && "Couldn't copy. Select the code and copy it yourself."}
      </span>
    </div>
  );
}
