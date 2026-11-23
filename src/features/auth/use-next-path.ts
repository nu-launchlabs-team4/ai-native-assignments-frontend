import { useSyncExternalStore } from "react";

import { safeNextPath } from "./next-path";

function subscribe(onChange: () => void): () => void {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}

/**
 * One query parameter from the address bar. Reading it this way (not with
 * useSearchParams) keeps the page static, with no Suspense boundary. Null on the server.
 */
export function useSearchParam(name: string): string | null {
  return useSyncExternalStore(
    subscribe,
    () => new URLSearchParams(window.location.search).get(name),
    () => null,
  );
}

/** The safe `?next=` page to return to after logging in, or null. */
export function useNextPath(): string | null {
  return safeNextPath(useSearchParam("next"));
}
