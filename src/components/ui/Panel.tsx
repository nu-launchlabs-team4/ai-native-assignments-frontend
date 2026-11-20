import type { ReactNode } from "react";

interface PanelProps {
  title: string;
  /** Unique id for the heading. The section is labelled by it for screen readers. */
  headingId: string;
  children: ReactNode;
  /** Small text or controls on the right of the header bar, such as a file name. */
  meta?: ReactNode;
  /** Extra classes for the outer section, such as a minimum height. */
  className?: string;
  /** Classes for the scrollable body, such as padding. */
  bodyClassName?: string;
}

/** An IDE-style pane: a slim header bar and a body that scrolls on its own. */
export function Panel({
  title,
  headingId,
  children,
  meta,
  className = "",
  bodyClassName = "p-4",
}: PanelProps) {
  return (
    <section aria-labelledby={headingId} className={`flex min-h-0 flex-col bg-surface ${className}`}>
      <div className="flex h-8 shrink-0 items-center justify-between gap-2 border-b border-line bg-surface-muted px-3">
        <h2 id={headingId} className="text-xs font-semibold uppercase tracking-wider text-muted">
          {title}
        </h2>
        {meta && <div className="truncate text-xs text-muted">{meta}</div>}
      </div>
      <div className={`min-h-0 flex-1 overflow-y-auto ${bodyClassName}`}>{children}</div>
    </section>
  );
}
