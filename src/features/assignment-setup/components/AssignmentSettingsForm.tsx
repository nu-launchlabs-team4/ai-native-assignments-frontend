import {
  AI_POLICY_LABELS,
  AIPolicy,
  FINAL_CHECK_LABELS,
  FinalCheck,
  HELP_LEVEL_LABELS,
  HelpLevel,
} from "@/lib/constants";

import type { AssignmentSettings } from "../types";

interface AssignmentSettingsFormProps {
  settings: AssignmentSettings;
  onChange: (settings: AssignmentSettings) => void;
}

interface Option<T extends string> {
  value: T;
  description: string;
}

const AI_POLICY_OPTIONS: readonly Option<AIPolicy>[] = [
  { value: AIPolicy.PROHIBITED, description: "Students work without the AI tutor." },
  { value: AIPolicy.PERMITTED, description: "Students may use the AI tutor after their attempt." },
  { value: AIPolicy.EXPECTED, description: "Students should use the AI tutor and evaluate its feedback." },
];

const HELP_LEVEL_OPTIONS: readonly Option<HelpLevel>[] = [
  { value: HelpLevel.HINTS, description: "Points to where to look, never how to fix it." },
  { value: HelpLevel.APPROACH, description: "Comments on the student's approach and reasoning." },
  { value: HelpLevel.CONCEPTS, description: "Explains the underlying concepts in depth." },
];

const FINAL_CHECK_OPTIONS: readonly Option<FinalCheck>[] = [
  { value: FinalCheck.AI_INTERVIEW, description: "Three questions the AI writes from each student's own work." },
  { value: FinalCheck.QUESTIONNAIRE, description: "The same questions, written by you, for every student." },
];

/** The professor's AI settings for the assignment: policy, help level and final check. */
export function AssignmentSettingsForm({ settings, onChange }: AssignmentSettingsFormProps) {
  return (
    <div className="flex flex-col gap-6">
      <RadioGroup
        name="ai_policy"
        legend="AI policy"
        options={AI_POLICY_OPTIONS}
        labels={AI_POLICY_LABELS}
        value={settings.ai_policy}
        onChange={(ai_policy) => onChange({ ...settings, ai_policy })}
      />
      <RadioGroup
        name="help_level"
        legend="AI help level"
        options={HELP_LEVEL_OPTIONS}
        labels={HELP_LEVEL_LABELS}
        value={settings.help_level}
        onChange={(help_level) => onChange({ ...settings, help_level })}
      />
      <RadioGroup
        name="final_check"
        legend="Final check"
        options={FINAL_CHECK_OPTIONS}
        labels={FINAL_CHECK_LABELS}
        value={settings.final_check}
        onChange={(final_check) => onChange({ ...settings, final_check })}
      />
    </div>
  );
}

interface RadioGroupProps<T extends string> {
  name: string;
  legend: string;
  options: readonly Option<T>[];
  labels: Record<T, string>;
  value: T;
  onChange: (value: T) => void;
}

function RadioGroup<T extends string>({ name, legend, options, labels, value, onChange }: RadioGroupProps<T>) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-sm font-semibold">{legend}</legend>
      {options.map((option) => {
        const id = `${name}-${option.value}`;
        return (
          <div key={option.value} className="flex items-start gap-2">
            <input
              id={id}
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              aria-describedby={`${id}-description`}
              className="mt-1 accent-accent focus-visible:outline-2 focus-visible:outline-offset-2"
            />
            <div>
              <label htmlFor={id} className="text-sm font-medium">
                {labels[option.value]}
              </label>
              <p id={`${id}-description`} className="text-xs text-muted">
                {option.description}
              </p>
            </div>
          </div>
        );
      })}
    </fieldset>
  );
}
