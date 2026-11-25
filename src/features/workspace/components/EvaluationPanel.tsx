"use client";

import { useId, useState } from "react";

import { Button } from "@/components/ui/Button";
import { type Segment, SegmentedControl } from "@/components/ui/SegmentedControl";
import { EvaluationVerdict, MAX_TEST_CASE_CHARS } from "@/lib/constants";

// Short answers to "Was the tutor's feedback right?", so they fit the narrow side panel.
// The professor's screens show the longer EVALUATION_VERDICT_LABELS for the same values.
const VERDICTS: readonly Segment<EvaluationVerdict>[] = [
  { value: EvaluationVerdict.CORRECT, label: "Yes" },
  { value: EvaluationVerdict.PARTLY_CORRECT, label: "Partly" },
  { value: EvaluationVerdict.INCORRECT, label: "No" },
];

interface EvaluationPanelProps {
  isSubmitting: boolean;
  submitError: string | null;
  onSubmit: (verdict: EvaluationVerdict, testCase: string) => void;
}

/** Step 3, under the question list: was the AI tutor's feedback right, and why. */
export function EvaluationPanel({ isSubmitting, submitError, onSubmit }: EvaluationPanelProps) {
  const [verdict, setVerdict] = useState<EvaluationVerdict | null>(null);
  const [testCase, setTestCase] = useState("");
  const reasonId = useId();
  const canSubmit = verdict !== null && testCase.trim() !== "" && !isSubmitting;

  return (
    <section aria-labelledby="evaluate-feedback" className="flex flex-col gap-4 border-t border-line p-4">
      <div className="flex flex-col gap-1">
        <h3 id="evaluate-feedback" className="text-sm font-semibold">
          Evaluate the feedback
        </h3>
        <p className="text-xs text-muted">
          Ask the AI tutor about your attempt first. Then decide whether its feedback holds up.
        </p>
      </div>

      <SegmentedControl
        legend="Was the tutor's feedback right?"
        segments={VERDICTS}
        value={verdict}
        onChange={setVerdict}
        disabled={isSubmitting}
      />

      <div className="flex flex-col gap-1">
        <label htmlFor={reasonId} className="text-sm font-medium">
          Why? Give a test case or example that shows it
        </label>
        <textarea
          id={reasonId}
          value={testCase}
          onChange={(event) => setTestCase(event.target.value)}
          maxLength={MAX_TEST_CASE_CHARS}
          rows={4}
          disabled={isSubmitting}
          placeholder="An input, what the right answer is, and what the feedback claimed."
          className="resize-none rounded-md border border-field bg-surface px-3 py-2 text-sm placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        />
        <p className="text-right text-xs text-muted">
          {testCase.length} / {MAX_TEST_CASE_CHARS}
        </p>
      </div>

      {submitError && (
        <p role="alert" className="text-sm text-danger">
          {submitError}
        </p>
      )}

      <Button
        disabled={!canSubmit}
        onClick={() => verdict !== null && onSubmit(verdict, testCase)}
        className="w-full"
      >
        {isSubmitting ? "Submitting…" : "Submit evaluation"}
      </Button>
      <p className="-mt-2 text-xs text-muted">Next, you revise your answers. Your attempt is kept as it was.</p>
    </section>
  );
}
