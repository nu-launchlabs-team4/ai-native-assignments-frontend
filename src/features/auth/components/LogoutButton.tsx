"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api";
import { ROUTES } from "@/lib/constants";

import { logOut } from "../auth-client";

/** Ends the session, then goes to the login page. */
export function LogoutButton() {
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
    <div className="flex items-center gap-2">
      {error && (
        <p role="alert" className="text-footnote text-danger">
          {error}
        </p>
      )}
      <Button variant="plain" size="small" onClick={handleClick} disabled={pending}>
        Log out
      </Button>
    </div>
  );
}
