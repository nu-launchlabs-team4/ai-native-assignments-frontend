import type { ReactNode } from "react";

interface WorkspaceShellProps {
  header: ReactNode;
  instructions: ReactNode;
  editor: ReactNode;
  aiPanel: ReactNode;
}

/**
 * Full-screen workspace frame: a header row, then instructions | editor | AI tutor.
 * Each column scrolls on its own. Below the lg breakpoint the columns stack.
 */
export function WorkspaceShell({ header, instructions, editor, aiPanel }: WorkspaceShellProps) {
  return (
    <div className="flex h-dvh flex-col bg-zinc-50 dark:bg-black">
      <header className="flex flex-col gap-3 border-b border-zinc-200 bg-white px-4 py-3 lg:flex-row lg:items-center lg:justify-between dark:border-zinc-800 dark:bg-zinc-950">
        {header}
      </header>
      {/* Narrow screens: panels take their natural height and the page area scrolls.
          lg and up: one full-height row, and each panel scrolls on its own. */}
      <main className="grid min-h-0 flex-1 auto-rows-max grid-cols-1 gap-3 overflow-y-auto p-3 lg:grid-cols-[minmax(18rem,1fr)_minmax(0,2fr)_minmax(18rem,1fr)] lg:grid-rows-[minmax(0,1fr)] lg:overflow-hidden">
        {instructions}
        {editor}
        {aiPanel}
      </main>
    </div>
  );
}
