import Link from "next/link";
import type { ReactNode } from "react";

import { AppearanceControl } from "@/components/AppearanceControl";
import { SidebarMenuButton } from "@/features/app-shell/components/SidebarMenuButton";

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
      <div className="flex items-center justify-between gap-3">
        <SidebarMenuButton />
        <Link
          href={backHref}
          className="mr-auto text-callout text-muted underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          ← {backLabel}
        </Link>
        <AppearanceControl />
      </div>
      <header className="flex flex-col gap-1">
        <p className="text-callout text-muted">{eyebrow}</p>
        <h1 className="text-large-title">{title}</h1>
      </header>
      {children}
    </main>
  );
}
