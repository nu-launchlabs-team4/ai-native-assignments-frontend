"use client";

import Link from "next/link";

import { LogoutButton } from "@/features/auth/components/LogoutButton";
import type { UserOut } from "@/lib/api-types";
import { Role, ROUTES } from "@/lib/constants";

import { navItemsFor, type NavItem } from "../nav-items";
import { NavIconGlyph } from "./NavIconGlyph";

const ROLE_LABELS: Record<Role, string> = { [Role.STUDENT]: "Student", [Role.PROFESSOR]: "Professor" };

const ITEM_CLASS =
  "flex min-h-9 items-center gap-3 rounded-md px-3 text-callout transition-colors " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus pointer-coarse:min-h-11 ";

function itemClass(current: boolean): string {
  return ITEM_CLASS + (current ? "bg-accent-soft font-semibold text-accent" : "text-foreground hover:bg-fill");
}

interface ShellNavProps {
  /** Null while the account loads: the menu comes from `role`, the account row is a placeholder. */
  user: UserOut | null;
  /** The menu to show: the account's role, or the page's area while the account loads. */
  role: Role | null;
  pathname: string;
  /** Called after any link is followed, so the phone menu can close. */
  onNavigate?: () => void;
}

/** The menu for the person's role, then their account (to Profile) and Log out. */
export function ShellNav({ user, role, pathname, onNavigate }: ShellNavProps) {
  const isCurrent = (item: Pick<NavItem, "href">) => pathname === item.href;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <nav aria-label="Main">
        <ul className="flex flex-col gap-0.5">
          {(role ? navItemsFor(role) : []).map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={isCurrent(item) ? "page" : undefined}
                className={itemClass(isCurrent(item))}
              >
                <NavIconGlyph icon={item.icon} />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto flex flex-col gap-1 border-t border-line pt-4">
        {user ? (
          <Link
            href={ROUTES.PROFILE}
            onClick={onNavigate}
            aria-current={isCurrent({ href: ROUTES.PROFILE }) ? "page" : undefined}
            className={`${itemClass(isCurrent({ href: ROUTES.PROFILE }))} py-2`}
          >
            <span
              aria-hidden="true"
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-footnote font-semibold text-accent-foreground"
            >
              {user.email.charAt(0).toUpperCase()}
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="truncate">{user.email}</span>
              <span className="text-caption font-normal text-muted">{ROLE_LABELS[user.role]} · Profile</span>
            </span>
          </Link>
        ) : (
          <div aria-hidden="true" className="flex items-center gap-3 px-3 py-2">
            <span className="size-8 rounded-full bg-fill motion-safe:animate-pulse" />
            <span className="h-3 w-32 rounded bg-fill motion-safe:animate-pulse" />
          </div>
        )}
        <LogoutButton className="px-1" />
      </div>
    </div>
  );
}
