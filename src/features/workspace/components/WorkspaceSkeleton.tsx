import { WorkspaceShell } from "./WorkspaceShell";

function Block({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800 ${className}`} />;
}

/** Placeholder with the workspace's shape, shown while the assignment loads. */
export function WorkspaceSkeleton() {
  return (
    <div aria-busy="true">
      <p role="status" className="sr-only">
        Loading assignment…
      </p>
      <WorkspaceShell
        header={<Block className="h-10 w-64" />}
        instructions={<Block className="min-h-48" />}
        editor={<Block className="min-h-96 lg:min-h-0" />}
        aiPanel={<Block className="min-h-48" />}
      />
    </div>
  );
}
