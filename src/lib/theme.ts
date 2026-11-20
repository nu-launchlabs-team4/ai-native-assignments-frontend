import { useSyncExternalStore } from "react";

import { THEME_STORAGE_KEY } from "@/lib/constants";

// Client-only: uses React hooks and the DOM. The pre-paint script lives in theme-init.ts.

export type Theme = "light" | "dark";

function readTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function subscribeToTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

/** The current theme. Re-renders when it changes anywhere on the page. */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribeToTheme, readTheme, () => "light");
}

/** Switch the theme and remember the choice for next time. */
export function setTheme(theme: Theme): void {
  document.documentElement.classList.toggle("dark", theme === "dark");
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage can be blocked (private mode). The theme still applies for this visit.
  }
}
