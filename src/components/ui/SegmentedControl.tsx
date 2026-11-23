import { type ReactNode, useId } from "react";

export interface Segment<T extends string | number> {
  value: T;
  /** The segment's name. Shown, or read to screen readers when the segment shows an icon. */
  label: string;
  /** An icon to show instead of the label. Use icons or text in one control, not both. */
  icon?: ReactNode;
}

interface SegmentedControlProps<T extends string | number> {
  /** What the choice is about. Becomes the group's accessible name. */
  legend: string;
  /** Hide the legend visually when the context already explains it. */
  hideLegend?: boolean;
  segments: readonly Segment<T>[];
  value: T | null;
  onChange: (value: T) => void;
  disabled?: boolean;
  /** Extra help under the control, such as what the ends of a scale mean. */
  hint?: ReactNode;
  className?: string;
}

/**
 * A single choice from a few options, as equal-width segments (Apple's segmented control).
 * Native radio buttons underneath, so arrow keys and screen readers work.
 */
export function SegmentedControl<T extends string | number>({
  legend,
  hideLegend = false,
  segments,
  value,
  onChange,
  disabled = false,
  hint,
  className = "",
}: SegmentedControlProps<T>) {
  const name = useId();
  const hintId = useId();

  return (
    <fieldset
      disabled={disabled}
      aria-describedby={hint ? hintId : undefined}
      className={`flex min-w-0 flex-col gap-2 ${className}`}
    >
      <legend className={hideLegend ? "sr-only" : "mb-2 text-footnote font-semibold"}>{legend}</legend>
      <div className="flex rounded-lg bg-surface-muted p-0.5">
        {segments.map((segment) => (
          <label
            key={segment.value}
            title={segment.icon ? segment.label : undefined}
            className={
              "flex h-7 min-w-8 flex-1 cursor-pointer items-center justify-center rounded-md px-2 text-footnote text-muted transition " +
              "hover:text-foreground has-checked:bg-surface has-checked:font-semibold has-checked:text-foreground has-checked:shadow-sm has-checked:ring-1 has-checked:ring-field " +
              "has-focus-visible:outline-2 has-focus-visible:outline-offset-1 has-focus-visible:outline-focus " +
              "active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 " +
              "has-disabled:cursor-default has-disabled:opacity-50 pointer-coarse:min-h-11"
            }
          >
            <input
              type="radio"
              name={name}
              value={segment.value}
              checked={value === segment.value}
              onChange={() => onChange(segment.value)}
              className="sr-only"
            />
            {segment.icon ? (
              <>
                {segment.icon}
                <span className="sr-only">{segment.label}</span>
              </>
            ) : (
              segment.label
            )}
          </label>
        ))}
      </div>
      {hint && (
        <p id={hintId} className="text-caption text-muted">
          {hint}
        </p>
      )}
    </fieldset>
  );
}
