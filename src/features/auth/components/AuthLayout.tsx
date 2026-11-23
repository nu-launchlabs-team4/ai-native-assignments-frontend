import Link from "next/link";
import type { ReactNode } from "react";

import { AppearanceControl } from "@/components/AppearanceControl";
import { ROUTES } from "@/lib/constants";

interface AuthLayoutProps {
  title: string;
  children: ReactNode;
  /** A line under the card, such as the link to the other form. */
  footer: ReactNode;
}

/** A narrow, centered card for the log-in and sign-up forms. */
export function AuthLayout({ title, children, footer }: AuthLayoutProps) {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-6 px-4 py-12 sm:py-20">
      <div className="flex items-center justify-between">
        <Link
          href={ROUTES.HOME}
          className="text-callout text-muted underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          ← Home
        </Link>
        <AppearanceControl />
      </div>
      <div className="flex flex-col gap-5 rounded-xl border border-line bg-surface p-6">
        <h1 className="text-large-title">{title}</h1>
        {children}
      </div>
      <p className="text-center text-callout text-muted">{footer}</p>
    </main>
  );
}

/** A link inside the footer line. */
export function AuthFooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
    >
      {children}
    </Link>
  );
}
