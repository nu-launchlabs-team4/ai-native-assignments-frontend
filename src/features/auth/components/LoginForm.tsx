"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api";
import { homeRouteFor, ROUTES } from "@/lib/constants";

import { logIn } from "../auth-client";
import { useNextPath } from "../use-next-path";
import { emailError, type FieldErrors, focusFirstInvalid, formErrors } from "../validation";
import { AuthField } from "./AuthField";
import { AuthFooterLink } from "./AuthLayout";
import { ResendConfirmation } from "./ResendConfirmation";

// The backend's answer for an account whose email isn't confirmed yet.
const EMAIL_NOT_CONFIRMED = 403;

/** Email and password log-in. Returns to `?next=` when it's safe, else to the role's home. */
export function LoginForm() {
  const router = useRouter();
  const next = useNextPath();
  const [pending, setPending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  // Set when the account exists but its email isn't confirmed, to offer the link again.
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const email = String(data.get("email") ?? "");
    const password = String(data.get("password") ?? "");

    const errors = formErrors(email, password, false);
    setFieldErrors(errors);
    setFormError(null);
    setUnconfirmedEmail(null);
    if (Object.keys(errors).length > 0) {
      focusFirstInvalid(form, errors);
      return;
    }

    setPending(true);
    try {
      const user = await logIn(email.trim(), password);
      router.replace(next ?? homeRouteFor(user.role));
      router.refresh();
    } catch (caught) {
      // Wrong credentials are about both fields together, so they go above the button.
      setFormError(caught instanceof ApiError ? caught.message : "Couldn't log in. Try again.");
      if (caught instanceof ApiError && caught.status === EMAIL_NOT_CONFIRMED) {
        setUnconfirmedEmail(email.trim());
      }
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4" aria-busy={pending}>
      <AuthField
        label="Email"
        name="email"
        autoComplete="email"
        disabled={pending}
        error={fieldErrors.email}
        focusOnDesktop
        onBlur={(value) => value && setFieldErrors((errors) => ({ ...errors, email: emailError(value) ?? undefined }))}
        onChange={() => setFieldErrors((errors) => ({ ...errors, email: undefined }))}
      />
      <AuthField
        label="Password"
        name="password"
        autoComplete="current-password"
        disabled={pending}
        labelAction={<AuthFooterLink href={ROUTES.FORGOT_PASSWORD}>Forgot password?</AuthFooterLink>}
        error={fieldErrors.password}
        onChange={() => setFieldErrors((errors) => ({ ...errors, password: undefined }))}
      />
      {formError && (
        <p role="alert" className="text-callout text-danger">
          {formError}
        </p>
      )}
      {unconfirmedEmail && <ResendConfirmation email={unconfirmedEmail} />}
      <Button type="submit" disabled={pending} className="h-10 w-full">
        {pending ? "Logging in…" : "Log in"}
      </Button>
    </form>
  );
}
