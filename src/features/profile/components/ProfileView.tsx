"use client";

import { type ReactNode, useState } from "react";

import { AppearanceControl } from "@/components/AppearanceControl";
import { Button } from "@/components/ui/Button";
import { useCurrentUser } from "@/features/app-shell/current-user";
import { requestPasswordReset } from "@/features/auth/auth-client";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { ApiError } from "@/lib/api";
import { Role } from "@/lib/constants";

const ROLE_LABELS: Record<Role, string> = { [Role.STUDENT]: "Student", [Role.PROFESSOR]: "Professor" };

type ResetState = { status: "idle" | "sending" | "sent" } | { status: "error"; message: string };

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-5">
      <h2 className="text-headline">{title}</h2>
      {children}
    </section>
  );
}

/** The account: who you are, changing the password, appearance and logging out. */
export function ProfileView() {
  const user = useCurrentUser();
  const [reset, setReset] = useState<ResetState>({ status: "idle" });

  if (!user) {
    return (
      <p role="status" className="text-body text-muted">
        Loading your account…
      </p>
    );
  }
  const { email } = user;

  async function sendResetLink() {
    setReset({ status: "sending" });
    try {
      await requestPasswordReset(email);
      setReset({ status: "sent" });
    } catch (caught) {
      setReset({ status: "error", message: caught instanceof ApiError ? caught.message : "Couldn't send the link." });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Section title="Account">
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-body">
          <dt className="text-muted">Email</dt>
          <dd className="min-w-0 break-words">{user.email}</dd>
          <dt className="text-muted">Role</dt>
          <dd>{ROLE_LABELS[user.role]}</dd>
        </dl>
        <p className="text-caption text-muted">Your role comes from the course list. Ask your course team to change it.</p>
      </Section>

      <Section title="Password">
        <p className="text-body text-muted">Get a link by email to choose a new password.</p>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="tinted" onClick={sendResetLink} disabled={reset.status === "sending"}>
            {reset.status === "sending" ? "Sending…" : "Email me a reset link"}
          </Button>
          {reset.status === "sent" && (
            <p role="status" className="text-callout text-success">
              ✓ Sent to {user.email}
            </p>
          )}
          {reset.status === "error" && (
            <p role="alert" className="text-callout text-danger">
              {reset.message}
            </p>
          )}
        </div>
      </Section>

      <Section title="Appearance">
        <AppearanceControl />
      </Section>

      <LogoutButton className="self-start" />
    </div>
  );
}
