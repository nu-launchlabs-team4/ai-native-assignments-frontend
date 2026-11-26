"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useRef } from "react";

import { Button, buttonClassName } from "@/components/ui/Button";
import { ROUTES } from "@/lib/constants";

interface CheckEmailPanelProps {
  /** What was sent and what to do with it. */
  children: ReactNode;
  /** Back to the form, to fix a mistyped address. */
  onUseDifferentEmail: () => void;
}

/** After an email goes out (sign-up confirmation, password reset): what happens next. */
export function CheckEmailPanel({ children, onUseDifferentEmail }: CheckEmailPanelProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  // The form this replaces had focus; move it here so screen readers read the result.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <h2 ref={headingRef} tabIndex={-1} className="text-title outline-none">
        Check your email
      </h2>
      <p className="text-body">{children}</p>
      <div className="flex flex-col gap-2">
        <Link href={ROUTES.LOGIN} className={buttonClassName({ className: "h-10 w-full" })}>
          Go to log in
        </Link>
        <Button variant="plain" onClick={onUseDifferentEmail} className="h-10 w-full">
          Use a different email
        </Button>
      </div>
    </div>
  );
}
