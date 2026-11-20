"use client";

import { setTheme, useTheme } from "@/lib/theme";

function SunIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

/** Sun or moon button that switches between light and dark mode. */
export function ThemeToggle() {
  const theme = useTheme();
  const nextTheme = theme === "dark" ? "light" : "dark";
  const label = `Switch to ${nextTheme} mode`;

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      aria-label={label}
      title={label}
      className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted hover:bg-line hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
