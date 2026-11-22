import Link from "next/link";
import type { ReactNode } from "react";

import { ThemeToggle } from "@/components/ThemeToggle";

interface ReviewLayoutProps {
  backHref: string;
  backLabel: string;
  /** Small text above the heading, such as the assignment title. */
  eyebrow: string;
  title: string;
  children: ReactNode;
}

/** Page frame for the professor's review screens: a back link, the heading and the content. */
export function ReviewLayout({ backHref, backLabel, eyebrow, title, children }: ReviewLayoutProps) {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-10">
      <div className="flex items-center justify-between">
        <Link
          href={backHref}
          className="text-sm text-muted underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          ← {backLabel}
        </Link>
        <ThemeToggle />
      </div>
      <header className="flex flex-col gap-1">
        <p className="text-sm text-muted">{eyebrow}</p>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      </header>
      {children}
    </main>
  );
}
