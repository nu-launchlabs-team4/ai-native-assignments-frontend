import { WorkspaceShell } from "./WorkspaceShell";

function Block({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-line ${className}`} />;
}

/** Placeholder with the workspace's shape, shown while the assignment loads. */
export function WorkspaceSkeleton() {
  return (
    <div aria-busy="true">
      <p role="status" className="sr-only">
        Loading assignment…
      </p>
      <WorkspaceShell
        header={<Block className="h-5 w-72" />}
        instructions={<Block className="m-4 min-h-40" />}
        editor={<Block className="m-4 min-h-96 lg:min-h-0" />}
        aiPanel={<Block className="m-4 min-h-40" />}
        statusBar={<Block className="h-3 w-40" />}
      />
    </div>
  );
}
