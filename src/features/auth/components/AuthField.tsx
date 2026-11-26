"use client";

import { type ReactNode, useEffect, useId, useRef, useState } from "react";

import { type AuthFieldName, EMAIL_MAX_CHARS, PASSWORD_MAX_CHARS, PASSWORD_MIN_CHARS } from "../validation";

interface AuthFieldProps {
  label: string;
  name: AuthFieldName;
  autoComplete: "email" | "current-password" | "new-password";
  disabled: boolean;
  /** The problem with this field, shown under it and read with it by screen readers. */
  error?: string;
  /** Validate when people leave the field. */
  onBlur?: (value: string) => void;
  /** Clear the field's error once people start fixing it. */
  onChange?: () => void;
  /** Put the cursor here when the page opens, on devices with a mouse or trackpad only. */
  focusOnDesktop?: boolean;
  /** A link on the label's line, such as "Forgot password?". */
  labelAction?: ReactNode;
}

const FINE_POINTER_QUERY = "(pointer: fine)";

/** A labelled email or password field. Passwords can be shown, and a new one shows its length rule live. */
export function AuthField({
  label,
  name,
  autoComplete,
  disabled,
  error,
  onBlur,
  onChange,
  focusOnDesktop,
  labelAction,
}: AuthFieldProps) {
  const id = useId();
  const errorId = useId();
  const ruleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [shown, setShown] = useState(false);
  const [length, setLength] = useState(0);

  const isPassword = name === "password";
  const isNewPassword = autoComplete === "new-password";
  const ruleMet = length >= PASSWORD_MIN_CHARS;
  // While there's an error, it says the same thing as the rule, so the rule steps aside.
  const showRule = isNewPassword && !error;

  useEffect(() => {
    // On phones, focusing on load would cover the page with the keyboard.
    if (focusOnDesktop && window.matchMedia(FINE_POINTER_QUERY).matches) inputRef.current?.focus();
  }, [focusOnDesktop]);

  const describedBy = [error ? errorId : null, showRule ? ruleId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3 text-callout">
        <label htmlFor={id} className="text-callout font-medium">
          {label}
        </label>
        {labelAction}
      </div>
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          name={name}
          type={isPassword && !shown ? "password" : isPassword ? "text" : "email"}
          inputMode={isPassword ? undefined : "email"}
          autoComplete={autoComplete}
          placeholder={isPassword ? undefined : "name@university.edu"}
          aria-required="true"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          maxLength={isPassword ? PASSWORD_MAX_CHARS : EMAIL_MAX_CHARS}
          disabled={disabled}
          onBlur={(event) => onBlur?.(event.currentTarget.value)}
          onChange={(event) => {
            setLength(event.currentTarget.value.length);
            onChange?.();
          }}
          className={
            "h-10 w-full rounded-md border bg-surface px-3 text-body text-foreground placeholder:text-muted " +
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:opacity-60 pointer-coarse:min-h-11 " +
            (isPassword ? "pr-16 " : "") +
            (error ? "border-danger" : "border-field")
          }
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShown((value) => !value)}
            disabled={disabled}
            aria-label={shown ? "Hide password" : "Show password"}
            aria-pressed={shown}
            className="absolute inset-y-1 right-1 rounded px-2.5 text-footnote font-medium text-accent hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-focus disabled:opacity-60 pointer-coarse:min-w-11"
          >
            {shown ? "Hide" : "Show"}
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} className="text-footnote text-danger">
          {error}
        </p>
      )}
      {showRule && (
        // A checkmark as well as the color, so the met rule isn't shown by color alone.
        <p id={ruleId} className={`text-caption ${ruleMet ? "text-success" : "text-muted"}`}>
          {ruleMet ? "✓ " : ""}At least {PASSWORD_MIN_CHARS} characters
        </p>
      )}
    </div>
  );
}
