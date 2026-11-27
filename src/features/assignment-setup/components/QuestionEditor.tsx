import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ANSWER_TYPE_LABELS, AnswerType, CODE_LANGUAGES } from "@/lib/constants";

import { isPromptMissing, withAnswerType } from "../questions";
import type { SetupQuestion } from "../types";

interface QuestionEditorProps {
  question: SetupQuestion;
  questionNumber: number;
  onChange: (question: SetupQuestion) => void;
  /** Removes the question. Left out when it's the only one, since an assignment needs one. */
  onRemove?: () => void;
}

const ANSWER_TYPE_SEGMENTS = Object.values(AnswerType).map((value) => ({ value, label: ANSWER_TYPE_LABELS[value] }));

const FIELD_BASE =
  "rounded-lg border border-field bg-surface text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";
const TEXT_AREA_CLASS = `${FIELD_BASE} px-3 py-2 text-body`;
// As tall as the segmented control beside it, and 44 px on touch screens.
const SELECT_CLASS = `${FIELD_BASE} h-8 px-2 text-callout pointer-coarse:min-h-11`;

/** Lets the professor correct one detected question: its text, answer type and language. */
export function QuestionEditor({ question, questionNumber, onChange, onRemove }: QuestionEditorProps) {
  const idPrefix = `question-${question.id}`;
  const promptMissing = isPromptMissing(question);
  // Keep a language the parser detected even if it isn't in our list, so it isn't silently lost.
  const knownLanguage = CODE_LANGUAGES.some((language) => language.id === question.language);

  return (
    <article aria-labelledby={`${idPrefix}-heading`} className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-5">
      <div className="flex items-center justify-between gap-2">
        <h3 id={`${idPrefix}-heading`} className="text-headline">
          Question {questionNumber}
        </h3>
        {onRemove && (
          <Button variant="plain" size="small" onClick={onRemove} aria-label={`Remove question ${questionNumber}`}>
            Remove
          </Button>
        )}
      </div>

      <label htmlFor={`${idPrefix}-prompt`} className="text-footnote font-semibold">
        Question text
      </label>
      <textarea
        id={`${idPrefix}-prompt`}
        value={question.prompt}
        onChange={(event) => onChange({ ...question, prompt: event.target.value })}
        rows={4}
        aria-invalid={promptMissing}
        aria-describedby={promptMissing ? `${idPrefix}-prompt-error` : undefined}
        className={TEXT_AREA_CLASS}
      />
      {promptMissing && (
        <ErrorMessage id={`${idPrefix}-prompt-error`} className="text-callout font-medium">
          Question text is required.
        </ErrorMessage>
      )}

      <div className="flex flex-wrap items-start gap-4">
        <SegmentedControl
          legend="Answer type"
          segments={ANSWER_TYPE_SEGMENTS}
          value={question.answer_type}
          onChange={(answerType) => onChange(withAnswerType(question, answerType))}
          className="w-full max-w-xs"
        />

        {question.answer_type === AnswerType.CODE && (
          <div className="flex flex-col gap-2">
            <label htmlFor={`${idPrefix}-language`} className="text-footnote font-semibold">
              Language
            </label>
            <select
              id={`${idPrefix}-language`}
              value={question.language ?? ""}
              onChange={(event) => onChange({ ...question, language: event.target.value })}
              className={SELECT_CLASS}
            >
              {!knownLanguage && question.language && (
                <option value={question.language}>{question.language}</option>
              )}
              {CODE_LANGUAGES.map((language) => (
                <option key={language.id} value={language.id}>
                  {language.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </article>
  );
}
