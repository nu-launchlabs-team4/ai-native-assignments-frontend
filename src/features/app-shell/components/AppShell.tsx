"use client";

import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect, useId, useState } from "react";

import { ProductMark } from "@/components/ProductMark";
import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { getMe } from "@/features/auth/auth-client";
import { ApiError } from "@/lib/api";
import type { UserOut } from "@/lib/api-types";
import { homeRouteFor, loginRoute } from "@/lib/constants";

import { CurrentUserProvider } from "../current-user";
import { areaRoleFor } from "../nav-items";
import { ShellNav } from "./ShellNav";

type LoadState = { status: "loading" } | { status: "ready"; user: UserOut } | { status: "error"; message: string };

const UNAUTHORIZED = 401;

/**
 * Sidebar layout for the signed-in pages. The page and the menu render straight away (the
 * menu comes from the URL's area until the account arrives), so navigation is instant.
 * Loading the account is the real session check: the proxy only sees that a cookie exists.
 * The backend still checks the session and role on every data call.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const menuId = useId();
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getMe()
      .then((user) => !cancelled && setState({ status: "ready", user }))
      .catch((caught: unknown) => {
        if (cancelled) return;
        if (caught instanceof ApiError && caught.status === UNAUTHORIZED) {
          router.replace(loginRoute(window.location.pathname));
          return;
        }
        setState({ status: "error", message: caught instanceof ApiError ? caught.message : "Couldn't load your account." });
      });
    return () => {
      cancelled = true;
    };
  }, [attempt, router]);

  const user = state.status === "ready" ? state.user : null;
  const areaRole = areaRoleFor(pathname);
  const menuRole = user?.role ?? areaRole;

  // A professor on a student page (or the other way round) goes to their own home.
  useEffect(() => {
    if (user && areaRole && areaRole !== user.role) router.replace(homeRouteFor(user.role));
  }, [user, areaRole, router]);

  return (
    <CurrentUserProvider value={user}>
      <div className="flex flex-1 flex-col md:flex-row">
        {/* Desktop and tablet: a sidebar. */}
        <aside className="hidden w-64 shrink-0 flex-col gap-6 border-r border-line bg-surface-muted p-4 md:sticky md:top-0 md:flex md:h-dvh">
          <div className="px-2 pt-1 text-foreground">
            <ProductMark />
          </div>
          <ShellNav user={user} role={menuRole} pathname={pathname} />
        </aside>

        {/* Phones: a top bar whose Menu button opens the same menu. */}
        <div className="border-b border-line bg-surface-muted md:hidden">
          <div className="flex items-center justify-between gap-4 px-4 py-2">
            <div className="text-foreground">
              <ProductMark />
            </div>
            <Button
              variant="plain"
              size="small"
              aria-expanded={menuOpen}
              aria-controls={menuId}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? "Close" : "Menu"}
            </Button>
          </div>
          {menuOpen && (
            <div id={menuId} className="flex px-4 pb-4">
              <ShellNav user={user} role={menuRole} pathname={pathname} onNavigate={() => setMenuOpen(false)} />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          {state.status === "error" && (
            <div className="flex flex-wrap items-center gap-3 border-b border-line bg-surface px-4 py-3 sm:px-8">
              <ErrorMessage role="alert" className="text-callout">
                {state.message}
              </ErrorMessage>
              <Button
                variant="tinted"
                size="small"
                onClick={() => {
                  setState({ status: "loading" });
                  setAttempt((value) => value + 1);
                }}
              >
                Try again
              </Button>
            </div>
          )}
          {children}
        </div>
      </div>
    </CurrentUserProvider>
  );
}
