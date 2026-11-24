"use client";

import { usePathname, useRouter } from "next/navigation";
import { type MouseEvent, useRef, useState } from "react";

import { ProductMark } from "@/components/ProductMark";
import { Button } from "@/components/ui/Button";
import { getMe } from "@/features/auth/auth-client";
import { ApiError } from "@/lib/api";
import type { UserOut } from "@/lib/api-types";
import { loginRoute } from "@/lib/constants";

import { areaRoleFor } from "../nav-items";
import { ShellNav } from "./ShellNav";

const UNAUTHORIZED = 401;

function SidebarIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 4v16" />
    </svg>
  );
}

/**
 * For full-screen pages that keep their whole width (the workspace, the professor's tools):
 * a button that slides in the same sidebar as a modal panel. Esc, a click outside, or
 * following a link closes it. The account loads the first time it opens.
 */
export function SidebarMenuButton() {
  const pathname = usePathname();
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<UserOut | null>(null);

  function show() {
    dialogRef.current?.showModal();
    setOpen(true);
    if (user) return;
    getMe()
      .then(setUser)
      .catch((caught: unknown) => {
        if (caught instanceof ApiError && caught.status === UNAUTHORIZED) router.replace(loginRoute(pathname));
      });
  }

  function hide() {
    dialogRef.current?.close();
  }

  // A click on the dimmed area lands on the dialog itself, outside its box.
  function closeOnBackdrop(event: MouseEvent<HTMLDialogElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    const inside =
      event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom;
    if (event.target === event.currentTarget && !inside) hide();
  }

  return (
    <>
      <Button
        variant="plain"
        size="icon"
        aria-label="Show menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={show}
        className="text-foreground"
      >
        <SidebarIcon />
      </Button>
      <dialog
        ref={dialogRef}
        aria-label="Menu"
        onClose={() => setOpen(false)}
        onClick={closeOnBackdrop}
        className="m-0 h-dvh max-h-none w-72 max-w-[85vw] flex-col gap-6 border-r border-line bg-surface-muted p-4 text-foreground backdrop:bg-black/40 open:flex"
      >
        <div className="flex items-center justify-between gap-2 px-2 pt-1">
          <ProductMark />
          <Button variant="plain" size="icon" aria-label="Close menu" onClick={hide}>
            <span aria-hidden="true" className="text-title leading-none">
              ×
            </span>
          </Button>
        </div>
        {open && <ShellNav user={user} role={user?.role ?? areaRoleFor(pathname)} pathname={pathname} onNavigate={hide} />}
      </dialog>
    </>
  );
}
