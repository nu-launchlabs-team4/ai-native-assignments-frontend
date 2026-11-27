"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { ApiError } from "@/lib/api";
import { homeRouteFor, ROUTES } from "@/lib/constants";

import { resetPassword } from "../auth-client";
import { useSearchParam } from "../use-next-path";
import { passwordError } from "../validation";
import { AuthField } from "./AuthField";
import { AuthFooterLink } from "./AuthLayout";

const BAD_REQUEST = 400;
const UNPROCESSABLE = 422;

/** Choose a new password from the reset email's link, then go to the role's home, logged in. */
export function ResetPasswordForm() {
  const router = useRouter();
  const tokenHash = useSearchParam("token_hash");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [linkProblem, setLinkProblem] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!tokenHash) return;
    const form = event.currentTarget;
    const password = String(new FormData(form).get("password") ?? "");
    const problem = passwordError(password, true);
    setError(problem ?? undefined);
    setFormError(null);
    if (problem) {
      form.querySelector<HTMLInputElement>('input[name="password"]')?.focus();
      return;
    }

    setPending(true);
    try {
      const user = await resetPassword(tokenHash, password);
      router.replace(homeRouteFor(user.role));
      router.refresh();
      return;
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === BAD_REQUEST) setLinkProblem(caught.message);
      else if (caught instanceof ApiError && caught.status === UNPROCESSABLE) setError(caught.message);
      else setFormError(caught instanceof ApiError ? caught.message : "Couldn't save the password. Try again.");
    }
    setPending(false);
  }

  if (!tokenHash || linkProblem) {
    return (
      <div className="flex flex-col gap-3">
        <p role="alert" className="text-body">
          {linkProblem ?? "This reset link is incomplete. Open the link from the email again, or request a new one."}
        </p>
        <p className="text-callout">
          <AuthFooterLink href={ROUTES.FORGOT_PASSWORD}>Request a new link</AuthFooterLink>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4" aria-busy={pending}>
      <AuthField
        label="New password"
        name="password"
        autoComplete="new-password"
        disabled={pending}
        error={error}
        focusOnDesktop
        onChange={() => setError(undefined)}
      />
      {formError && (
        <ErrorMessage role="alert" className="text-callout">
          {formError}
        </ErrorMessage>
      )}
      <Button type="submit" disabled={pending} className="h-10 w-full">
        {pending ? "Saving…" : "Save password and log in"}
      </Button>
    </form>
  );
}
