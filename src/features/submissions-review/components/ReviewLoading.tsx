/** Shown while a review page loads its data. */
export function ReviewLoading() {
  return (
    <main aria-busy="true" className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-6 py-10">
      <p role="status" className="sr-only">
        Loading…
      </p>
      <div className="h-8 w-72 motion-safe:animate-pulse rounded bg-line" />
      <div className="h-48 motion-safe:animate-pulse rounded bg-line" />
    </main>
  );
}
