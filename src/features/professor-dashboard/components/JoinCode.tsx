"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";

/** How long "Copied" stays before the status clears. */
export const COPIED_MESSAGE_MS = 2000;

const COPIED = "Copied";
const COPY_FAILED = "Couldn't copy. Select the code and copy it.";

function studentsLabel(count: number): string {
  if (count === 0) return "No students yet";
  return `${count} ${count === 1 ? "student" : "students"} joined`;
}

interface JoinCodeProps {
  code: string;
  studentCount: number;
}

/** The code students join the course with, ready to copy or read out in class. */
export function JoinCode({ code, studentCount }: JoinCodeProps) {
  const [status, setStatus] = useState("");
  const clearTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(clearTimer.current), []);

  async function copy() {
    window.clearTimeout(clearTimer.current);
    try {
      await navigator.clipboard.writeText(code);
      setStatus(COPIED);
      clearTimer.current = window.setTimeout(() => setStatus(""), COPIED_MESSAGE_MS);
    } catch {
      // No clipboard access (an older browser, or permission denied). The code is selectable.
      setStatus(COPY_FAILED);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md bg-fill px-3 py-2">
      <span className="text-footnote text-muted">Join code</span>
      <span className="select-all font-mono text-callout font-semibold tracking-wider">{code}</span>
      <Button variant="plain" size="small" aria-label="Copy join code" onClick={copy}>
        Copy
      </Button>
      <span role="status" className="text-footnote text-muted">
        {status}
      </span>
      <span className="ml-auto text-footnote text-muted">{studentsLabel(studentCount)}</span>
    </div>
  );
}
