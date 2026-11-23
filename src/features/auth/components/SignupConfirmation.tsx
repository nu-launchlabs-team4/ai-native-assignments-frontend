"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { Button, buttonClassName } from "@/components/ui/Button";
import { ROUTES } from "@/lib/constants";

interface SignupConfirmationProps {
  email: string;
  /** Back to the form, to fix a mistyped address. */
  onUseDifferentEmail: () => void;
}

/** After sign-up, when Supabase wants the email confirmed: where the link went, and what to do next. */
export function SignupConfirmation({ email, onUseDifferentEmail }: SignupConfirmationProps) {
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
      <p className="text-body">
        A confirmation link is on its way to <strong className="font-semibold">{email}</strong>. Open it, then log in.
      </p>
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
