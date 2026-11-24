import type { ReactNode } from "react";

interface ShellPageProps {
  title: string;
  description?: ReactNode;
  children: ReactNode;
}

/** The content column of a page inside the app shell: title, one line about it, then the page. */
export function ShellPage({ title, description, children }: ShellPageProps) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-8 sm:py-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-large-title">{title}</h1>
        {description && <p className="text-body text-muted">{description}</p>}
      </div>
      {children}
    </main>
  );
}
