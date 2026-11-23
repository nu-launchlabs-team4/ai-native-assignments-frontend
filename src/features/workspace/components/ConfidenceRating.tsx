import { useId } from "react";

import { CONFIDENCE_MAX, CONFIDENCE_MIN } from "@/lib/constants";

const LEVELS = Array.from({ length: CONFIDENCE_MAX - CONFIDENCE_MIN + 1 }, (_, i) => CONFIDENCE_MIN + i);

interface ConfidenceRatingProps {
  value: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
}

/**
 * How sure the student is about their attempt, from 1 to 5. Native radio buttons,
 * so arrow keys and screen readers work without extra code.
 */
export function ConfidenceRating({ value, onChange, disabled = false }: ConfidenceRatingProps) {
  const name = useId();
  const hintId = useId();

  return (
    <fieldset className="flex flex-col gap-2" aria-describedby={hintId} disabled={disabled}>
      <legend className="text-sm font-medium">How confident are you?</legend>
      <div className="flex gap-1.5">
        {LEVELS.map((level) => (
          <label
            key={level}
            className="flex size-9 cursor-pointer items-center justify-center rounded border border-line text-sm has-checked:border-accent has-checked:bg-accent has-checked:text-accent-foreground has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-disabled:cursor-default has-disabled:opacity-60"
          >
            <input
              type="radio"
              name={name}
              value={level}
              checked={value === level}
              onChange={() => onChange(level)}
              className="sr-only"
            />
            {level}
          </label>
        ))}
      </div>
      <p id={hintId} className="flex justify-between text-xs text-muted">
        <span>{CONFIDENCE_MIN}: not sure</span>
        <span>{CONFIDENCE_MAX}: very sure</span>
      </p>
    </fieldset>
  );
}
