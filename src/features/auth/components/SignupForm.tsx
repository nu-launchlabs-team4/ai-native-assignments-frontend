"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api";
import { homeRouteFor } from "@/lib/constants";

import { signUp } from "../auth-client";
import { AuthField, PASSWORD_MIN_CHARS } from "./AuthField";

/**
 * Create an account. There's no role choice: the backend makes professors from its
 * allowlist of emails, so nobody can pick their own role.
 */
export function SignupForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmEmailTo, setConfirmEmailTo] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email"));
    setPending(true);
    setError(null);
    try {
      const result = await signUp(email, String(form.get("password")));
      if (result.user) {
        router.replace(homeRouteFor(result.user.role));
        router.refresh();
        return;
      }
      setConfirmEmailTo(email);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Couldn't create the account. Try again.");
    }
    setPending(false);
  }

  if (confirmEmailTo) {
    return (
      <p role="status" className="text-body">
        We sent a link to <strong className="font-semibold">{confirmEmailTo}</strong>. Open it to confirm your
        email, then log in.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" aria-busy={pending}>
      <AuthField label="Email" name="email" autoComplete="email" disabled={pending} />
      <AuthField
        label="Password"
        name="password"
        autoComplete="new-password"
        disabled={pending}
        hint={`At least ${PASSWORD_MIN_CHARS} characters.`}
      />
      <p className="text-caption text-muted">
        Professors: sign up with the email your course team registered, and you&apos;ll get professor access.
      </p>
      {error && (
        <p role="alert" className="text-callout text-danger">
          {error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
