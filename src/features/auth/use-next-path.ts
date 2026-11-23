import { useSyncExternalStore } from "react";

import { safeNextPath } from "./next-path";

function subscribe(onChange: () => void): () => void {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}

function readNextPath(): string | null {
  return safeNextPath(new URLSearchParams(window.location.search).get("next"));
}

/**
 * The safe `?next=` page, read from the address bar. Reading it this way (not with
 * useSearchParams) keeps the page static, with no Suspense boundary. Null on the server.
 */
export function useNextPath(): string | null {
  return useSyncExternalStore(subscribe, readNextPath, () => null);
}
