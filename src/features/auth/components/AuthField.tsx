import { useId } from "react";

interface AuthFieldProps {
  label: string;
  name: "email" | "password";
  autoComplete: "email" | "current-password" | "new-password";
  disabled: boolean;
  /** Help under the field, such as the password rule. */
  hint?: string;
}

// Mirrors the backend's SignupIn and LoginIn limits.
export const PASSWORD_MIN_CHARS = 8;
export const PASSWORD_MAX_CHARS = 72;

/** A labelled email or password input. */
export function AuthField({ label, name, autoComplete, disabled, hint }: AuthFieldProps) {
  const id = useId();
  const hintId = useId();
  const isPassword = name === "password";

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-callout font-medium">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={isPassword ? "password" : "email"}
        autoComplete={autoComplete}
        required
        disabled={disabled}
        minLength={isPassword ? PASSWORD_MIN_CHARS : undefined}
        maxLength={isPassword ? PASSWORD_MAX_CHARS : 320}
        aria-describedby={hint ? hintId : undefined}
        className="h-10 rounded-md border border-field bg-surface px-3 text-body text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:opacity-60 pointer-coarse:min-h-11"
      />
      {hint && (
        <p id={hintId} className="text-caption text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}
