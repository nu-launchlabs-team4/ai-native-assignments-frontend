"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api";
import { homeRouteFor } from "@/lib/constants";

import { signUp } from "../auth-client";
import { emailError, type FieldErrors, focusFirstInvalid, formErrors, passwordError } from "../validation";
import { AuthField } from "./AuthField";
import { SignupConfirmation } from "./SignupConfirmation";

const CONFLICT = 409;
const UNPROCESSABLE = 422;

/**
 * Create an account. There's no role choice: the backend makes professors from its
 * allowlist of emails, so nobody can pick their own role.
 */
export function SignupForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmEmailTo, setConfirmEmailTo] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");

    const errors = formErrors(email, password, true);
    setFieldErrors(errors);
    setFormError(null);
    if (Object.keys(errors).length > 0) {
      focusFirstInvalid(form, errors);
      return;
    }

    setPending(true);
    try {
      const result = await signUp(email, password);
      if (result.user) {
        router.replace(homeRouteFor(result.user.role));
        router.refresh();
        return;
      }
      setConfirmEmailTo(email);
    } catch (caught) {
      showServerError(caught, form);
    }
    setPending(false);
  }

  // Put the backend's answer next to the field it's about.
  function showServerError(caught: unknown, form: HTMLFormElement) {
    if (!(caught instanceof ApiError)) {
      setFormError("Couldn't create the account. Try again.");
      return;
    }
    const field =
      caught.status === CONFLICT || (caught.status === UNPROCESSABLE && /email/i.test(caught.message))
        ? "email"
        : caught.status === UNPROCESSABLE
          ? "password"
          : null;
    if (field) {
      setFieldErrors({ [field]: caught.message });
      focusFirstInvalid(form, { [field]: caught.message });
    } else {
      setFormError(caught.message);
    }
  }

  if (confirmEmailTo) {
    return <SignupConfirmation email={confirmEmailTo} onUseDifferentEmail={() => setConfirmEmailTo(null)} />;
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
        autoComplete="new-password"
        disabled={pending}
        error={fieldErrors.password}
        onBlur={(value) =>
          value && setFieldErrors((errors) => ({ ...errors, password: passwordError(value, true) ?? undefined }))
        }
        onChange={() => setFieldErrors((errors) => ({ ...errors, password: undefined }))}
      />
      <p className="text-caption text-muted">
        Professors get professor access automatically when their email is on the course list.
      </p>
      {formError && (
        <p role="alert" className="text-callout text-danger">
          {formError}
        </p>
      )}
      <Button type="submit" disabled={pending} className="h-10 w-full">
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
