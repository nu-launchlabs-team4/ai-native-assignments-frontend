import type { ReactNode } from "react";

interface PanelProps {
  title: string;
  /** Unique id for the heading. The section is labelled by it for screen readers. */
  headingId: string;
  children: ReactNode;
  /** Extra classes for the outer section, such as a minimum height. */
  className?: string;
  /** Classes for the scrollable body, such as padding. */
  bodyClassName?: string;
}

/** A titled section with its own scrollable body. Used for the workspace columns. */
export function Panel({
  title,
  headingId,
  children,
  className = "",
  bodyClassName = "p-4",
}: PanelProps) {
  return (
    <section
      aria-labelledby={headingId}
      className={`flex min-h-0 flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 ${className}`}
    >
      <h2
        id={headingId}
        className="border-b border-zinc-200 px-4 py-2 text-sm font-semibold dark:border-zinc-800"
      >
        {title}
      </h2>
      <div className={`min-h-0 flex-1 overflow-y-auto ${bodyClassName}`}>{children}</div>
    </section>
  );
}
