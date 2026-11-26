"use client";

import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api";

import { requestPasswordReset } from "../auth-client";
import { emailError } from "../validation";
import { AuthField } from "./AuthField";
import { CheckEmailPanel } from "./CheckEmailPanel";

/** Ask for a reset link. The answer is the same whether or not the account exists. */
export function ForgotPasswordForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = String(new FormData(form).get("email") ?? "").trim();
    const problem = emailError(email);
    setError(problem ?? undefined);
    setFormError(null);
    if (problem) {
      form.querySelector<HTMLInputElement>('input[name="email"]')?.focus();
      return;
    }

    setPending(true);
    try {
      await requestPasswordReset(email);
      setSentTo(email);
    } catch (caught) {
      setFormError(caught instanceof ApiError ? caught.message : "Couldn't send the link. Try again.");
    }
    setPending(false);
  }

  if (sentTo) {
    return (
      <CheckEmailPanel onUseDifferentEmail={() => setSentTo(null)}>
        If there&apos;s an account for <strong className="font-semibold">{sentTo}</strong>, a link to choose a new
        password is on its way. It works once.
      </CheckEmailPanel>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4" aria-busy={pending}>
      <AuthField
        label="Email"
        name="email"
        autoComplete="email"
        disabled={pending}
        error={error}
        focusOnDesktop
        onChange={() => setError(undefined)}
      />
      {formError && (
        <p role="alert" className="text-callout text-danger">
          {formError}
        </p>
      )}
      <Button type="submit" disabled={pending} className="h-10 w-full">
        {pending ? "Sending link…" : "Send reset link"}
      </Button>
    </form>
  );
}
