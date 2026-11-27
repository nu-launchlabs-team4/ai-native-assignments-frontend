"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { ApiError } from "@/lib/api";
import { ROUTES } from "@/lib/constants";

import { logOut } from "../auth-client";

/** Ends the session, then goes to the login page. */
export function LogoutButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setPending(true);
    setError(null);
    try {
      await logOut();
      router.replace(ROUTES.LOGIN);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Couldn't log out. Try again.");
      setPending(false);
    }
  }

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {error && (
        <ErrorMessage role="alert" className="text-footnote">
          {error}
        </ErrorMessage>
      )}
      <Button variant="plain" size="small" onClick={handleClick} disabled={pending} className="justify-start">
        Log out
      </Button>
    </div>
  );
}
