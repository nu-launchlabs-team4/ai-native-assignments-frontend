import Link from "next/link";
import type { ReactNode } from "react";

import { ROUTES } from "@/lib/constants";

interface PagePlaceholderProps {
  title: string;
  description: string;
  children?: ReactNode;
}

/** Layout for pages that are not built yet. */
export function PagePlaceholder({ title, description, children }: PagePlaceholderProps) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-16">
      <Link
        href={ROUTES.HOME}
        className="text-sm text-zinc-600 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 dark:text-zinc-400"
      >
        ← Home
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="text-zinc-600 dark:text-zinc-400">{description}</p>
      {children}
    </main>
  );
}
