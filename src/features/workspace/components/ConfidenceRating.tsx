import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { CONFIDENCE_MAX, CONFIDENCE_MIN } from "@/lib/constants";

const LEVELS = Array.from({ length: CONFIDENCE_MAX - CONFIDENCE_MIN + 1 }, (_, i) => {
  const level = CONFIDENCE_MIN + i;
  return { value: level, label: String(level) };
});

interface ConfidenceRatingProps {
  value: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
}

/** How sure the student is about their attempt, from 1 to 5. */
export function ConfidenceRating({ value, onChange, disabled = false }: ConfidenceRatingProps) {
  return (
    <SegmentedControl
      legend="How confident are you?"
      segments={LEVELS}
      value={value}
      onChange={onChange}
      disabled={disabled}
      hint={
        <span className="flex justify-between">
          <span>{CONFIDENCE_MIN}: not sure</span>
          <span>{CONFIDENCE_MAX}: very sure</span>
        </span>
      }
    />
  );
}
