import type { ReactNode } from "react";

// Line icons for the landing page. Decorative: the text next to each one names it.

interface IconProps {
  className?: string;
}

function Icon({ className = "size-6", children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export function GraduationCapIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M2 9l10-5 10 5-10 5-10-5z" />
      <path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" />
      <path d="M22 9v6" />
    </Icon>
  );
}

export function PersonIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
    </Icon>
  );
}
