import type { ReactNode } from "react";

interface ErrorMessageProps {
  children: ReactNode;
  id?: string;
  /** "alert" when the error appears after an action, so screen readers announce it. */
  role?: "alert";
  /** Text size and weight, such as "text-callout font-medium". */
  className?: string;
}

/**
 * An error: a warning icon and words, in red. Red is also Northeastern's brand color, so
 * an error never relies on color alone.
 */
export function ErrorMessage({ children, id, role, className = "text-callout" }: ErrorMessageProps) {
  return (
    <p id={id} role={role} className={`flex items-start gap-1.5 text-danger ${className}`}>
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        fill="currentColor"
        className="mt-[0.2em] size-[1em] shrink-0"
      >
        <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm-.75 3.5a.75.75 0 0 1 1.5 0v4a.75.75 0 0 1-1.5 0v-4ZM8 11.75a.9.9 0 1 1 0-1.8.9.9 0 0 1 0 1.8Z" />
      </svg>
      <span>{children}</span>
    </p>
  );
}
