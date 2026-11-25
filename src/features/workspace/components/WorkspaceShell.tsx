
import type { ReactNode } from "react";

interface WorkspaceShellProps {
  header: ReactNode;
  notice?: ReactNode;
  instructions: ReactNode;
  editor: ReactNode;
  aiPanel: ReactNode;
  statusBar: ReactNode;
}

/**
 * Full-screen, IDE-style frame: a top bar, an optional notice,
 * then instructions | editor | AI tutor, and a status bar.
 * On narrow screens the panes stack and the middle area scrolls.
 */
export function WorkspaceShell({
  header,
  notice,
  instructions,
  editor,
  aiPanel,
  statusBar,
}: WorkspaceShellProps) {
  return (
    <div className="flex h-dvh flex-col bg-surface text-foreground">
      <header className="flex min-h-12 shrink-0 flex-wrap items-center gap-x-6 gap-y-2 border-b border-line bg-surface-muted px-3 py-2">
        {header}
      </header>

      {notice}

      <main className="grid min-h-0 flex-1 auto-rows-max grid-cols-1 divide-y divide-line overflow-y-auto lg:grid-cols-[20rem_minmax(0,1fr)_22rem] lg:grid-rows-[minmax(0,1fr)] lg:divide-x lg:divide-y-0 lg:overflow-hidden">
        {instructions}
        {editor}
        {aiPanel}
      </main>

      <footer className="flex h-6 shrink-0 items-center border-t border-line bg-surface-muted px-3 text-xs text-muted">
        {statusBar}
      </footer>
    </div>
  );
}
