import Link from "next/link";
import type { ReactNode } from "react";

import { FOCUS_CLASS } from "../styles";

interface RoleCardProps {
  href: string;
  title: string;
  description: string;
  action: string;
  icon: ReactNode;
}

/** A whole card that is one link, so it's a single tab stop and one big target. */
export function RoleCard({ href, title, description, action, icon }: RoleCardProps) {
  return (
    <Link
      href={href}
      className={
        "group flex h-full flex-col gap-4 rounded-2xl border border-line bg-surface p-6 shadow-xs transition-transform " +
        "hover:border-foreground active:scale-[0.99] motion-reduce:transition-none motion-reduce:active:scale-100 " +
        FOCUS_CLASS
      }
    >
      <span className="flex size-12 items-center justify-center rounded-xl bg-brand-tile text-brand">{icon}</span>
      <span className="flex flex-col gap-1">
        <span className="text-title text-foreground">{title}</span>
        <span className="text-body text-muted">{description}</span>
      </span>
      <span className="mt-auto flex items-center gap-1 text-callout font-semibold text-brand-action">
        {action}
        <span
          aria-hidden="true"
          className="transition group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
        >
          →
        </span>
      </span>
    </Link>
  );
}
