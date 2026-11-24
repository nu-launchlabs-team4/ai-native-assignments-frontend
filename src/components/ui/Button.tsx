import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "filled" | "tinted" | "plain";
export type ButtonSize = "regular" | "small" | "icon";

const BASE =
  "inline-flex shrink-0 select-none items-center justify-center gap-1.5 rounded-md font-medium transition " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent " +
  // Press state (Apple: "Always include a press state for a custom button"), off under reduced motion.
  "active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 " +
  "disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100";

const VARIANTS: Record<ButtonVariant, string> = {
  // The most likely action in a view. Keep it to one or two per view.
  filled: "bg-accent text-accent-foreground hover:opacity-90 active:opacity-80",
  tinted: "bg-accent-soft text-accent hover:opacity-90 active:opacity-80",
  plain: "text-accent hover:bg-surface-muted active:bg-surface-muted",
};

// Mouse sizes match the desktop default (28 pt and up); touch screens get 44 px targets.
const SIZES: Record<ButtonSize, string> = {
  regular: "h-9 px-4 text-callout pointer-coarse:min-h-11",
  small: "h-7 px-2.5 text-footnote pointer-coarse:min-h-11",
  icon: "size-8 pointer-coarse:size-11",
};

/** Class names for a button look, for links that should look like buttons. */
export function buttonClassName({
  variant = "filled",
  size = "regular",
  className = "",
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}): string {
  return `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

/** The app's button. Use filled for the main action, tinted for secondary ones, plain for the rest. */
export function Button({ variant = "filled", size = "regular", className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClassName({ variant, size, className })} {...props} />;
}
