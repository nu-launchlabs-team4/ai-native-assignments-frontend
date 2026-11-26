import { useSyncExternalStore } from "react";

import { DARK_SCHEME_QUERY, THEME_STORAGE_KEY } from "@/lib/constants";

// Client-only: uses React hooks and the DOM. The pre-paint script lives in theme-init.ts.

/** The appearance on screen right now. */
export type Theme = "light" | "dark";

/** What the person chose. "system" follows the device, as Apple's guidelines ask. */
export type ThemePreference = Theme | "system";

function readTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function subscribeToTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

/** The appearance on screen. Re-renders when it changes for any reason. */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribeToTheme, readTheme, () => "light");
}

function readPreference(): ThemePreference {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved === "light" || saved === "dark" ? saved : "system";
  } catch {
    return "system";
  }
}

const preferenceListeners = new Set<() => void>();

function subscribeToPreference(onChange: () => void) {
  preferenceListeners.add(onChange);
  // Another tab changing the setting updates this one too.
  window.addEventListener("storage", onChange);
  return () => {
    preferenceListeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** The person's appearance choice: system, light or dark. */
export function useThemePreference(): ThemePreference {
  return useSyncExternalStore(subscribeToPreference, readPreference, () => "system");
}

/** Save the appearance choice and apply it now. "system" clears the saved choice. */
export function setThemePreference(preference: ThemePreference): void {
  try {
    if (preference === "system") {
      localStorage.removeItem(THEME_STORAGE_KEY);
    } else {
      localStorage.setItem(THEME_STORAGE_KEY, preference);
    }
  } catch {
    // Storage can be blocked (private mode). The choice still applies for this visit.
  }
  const isDark =
    preference === "dark" || (preference === "system" && window.matchMedia(DARK_SCHEME_QUERY).matches);
  document.documentElement.classList.toggle("dark", isDark);
  preferenceListeners.forEach((listener) => listener());
}
