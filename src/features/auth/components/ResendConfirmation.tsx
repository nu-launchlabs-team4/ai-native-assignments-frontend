"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api";

import { resendConfirmation } from "../auth-client";

/** How long to wait before the link can be sent again. Supabase also limits emails. */
export const RESEND_COOLDOWN_SECONDS = 60;

const SEND_FAILED = "Couldn't send the link. Try again in a minute.";

type ResendState =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent"; secondsLeft: number }
  | { kind: "error"; message: string };

interface ResendConfirmationProps {
  email: string;
}

/** "Send the link again" for an unconfirmed account, with a cooldown after each send. */
export function ResendConfirmation({ email }: ResendConfirmationProps) {
  const [state, setState] = useState<ResendState>({ kind: "idle" });
  const coolingDown = state.kind === "sent" && state.secondsLeft > 0;

  // Count the cooldown down once a second.
  useEffect(() => {
    if (!coolingDown) return;
    const timer = window.setInterval(() => {
      setState((current) =>
        current.kind === "sent" ? { kind: "sent", secondsLeft: current.secondsLeft - 1 } : current,
      );
    }, 1000);
    return () => window.clearInterval(timer);
  }, [coolingDown]);

  async function send() {
    setState({ kind: "sending" });
    try {
      await resendConfirmation(email);
      setState({ kind: "sent", secondsLeft: RESEND_COOLDOWN_SECONDS });
    } catch (caught) {
      setState({ kind: "error", message: caught instanceof ApiError ? caught.message : SEND_FAILED });
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        variant="plain"
        onClick={send}
        disabled={state.kind === "sending" || coolingDown}
        className="h-10 w-full"
      >
        {state.kind === "sending"
          ? "Sending…"
          : coolingDown
            ? `Send again in ${state.secondsLeft} s`
            : "Send the link again"}
      </Button>
      {/* One live region for the outcome, so screen readers hear "Sent" or the error once. */}
      <p role="status" className="text-center text-footnote text-muted">
        {state.kind === "sent" && `Sent to ${email}. Check your inbox and spam folder.`}
      </p>
      {state.kind === "error" && (
        <p role="alert" className="text-center text-footnote text-danger">
          {state.message}
        </p>
      )}
    </div>
  );
}
