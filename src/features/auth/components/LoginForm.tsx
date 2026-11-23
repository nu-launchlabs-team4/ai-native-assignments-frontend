"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api";
import { homeRouteFor } from "@/lib/constants";

import { logIn } from "../auth-client";
import { safeNextPath } from "../next-path";
import { AuthField } from "./AuthField";

/** Email and password log-in. Returns to `?next=` when it's safe, else to the role's home. */
export function LoginForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError(null);
    try {
      const user = await logIn(String(form.get("email")), String(form.get("password")));
      // Read at submit time, so the page needs no Suspense boundary for search params.
      const next = safeNextPath(new URLSearchParams(window.location.search).get("next"));
      router.replace(next ?? homeRouteFor(user.role));
      router.refresh();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Couldn't log in. Try again.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" aria-busy={pending}>
      <AuthField label="Email" name="email" autoComplete="email" disabled={pending} />
      <AuthField label="Password" name="password" autoComplete="current-password" disabled={pending} />
      {error && (
        <p role="alert" className="text-callout text-danger">
          {error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Logging in…" : "Log in"}
      </Button>
    </form>
  );
}
