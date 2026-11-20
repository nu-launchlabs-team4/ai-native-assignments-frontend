interface TextAnswerProps {
  value: string;
  ariaLabel: string;
  onChange: (value: string) => void;
}

/** Plain text area for written answers. */
export function TextAnswer({ value, ariaLabel, onChange }: TextAnswerProps) {
  return (
    <textarea
      aria-label={ariaLabel}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Write your answer here."
      className="block h-full min-h-60 w-full resize-none bg-surface p-4 text-sm leading-6 text-foreground placeholder:text-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
    />
  );
}
