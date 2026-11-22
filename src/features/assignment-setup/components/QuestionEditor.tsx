import { ANSWER_TYPE_LABELS, AnswerType, CODE_LANGUAGES } from "@/lib/constants";

import { isPromptMissing, withAnswerType } from "../questions";
import type { SetupQuestion } from "../types";

interface QuestionEditorProps {
  question: SetupQuestion;
  questionNumber: number;
  onChange: (question: SetupQuestion) => void;
}

const ANSWER_TYPES = Object.values(AnswerType);

const FIELD_CLASS =
  "rounded-md border border-line bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/** Lets the professor correct one detected question: its text, answer type and language. */
export function QuestionEditor({ question, questionNumber, onChange }: QuestionEditorProps) {
  const idPrefix = `question-${question.id}`;
  const promptMissing = isPromptMissing(question);
  // Keep a language the parser detected even if it isn't in our list, so it isn't silently lost.
  const knownLanguage = CODE_LANGUAGES.some((language) => language.id === question.language);

  return (
    <article aria-labelledby={`${idPrefix}-heading`} className="flex flex-col gap-3 rounded-md border border-line bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 id={`${idPrefix}-heading`} className="text-sm font-semibold">
          Question {questionNumber}
        </h3>
        <span className="rounded border border-line px-1.5 py-0.5 text-xs text-muted">
          {ANSWER_TYPE_LABELS[question.answer_type]}
        </span>
      </div>

      <label htmlFor={`${idPrefix}-prompt`} className="text-sm font-medium">
        Question text
      </label>
      <textarea
        id={`${idPrefix}-prompt`}
        value={question.prompt}
        onChange={(event) => onChange({ ...question, prompt: event.target.value })}
        rows={4}
        aria-invalid={promptMissing}
        aria-describedby={promptMissing ? `${idPrefix}-prompt-error` : undefined}
        className={`${FIELD_CLASS} leading-6`}
      />
      {promptMissing && (
        <p id={`${idPrefix}-prompt-error`} className="text-sm font-medium">
          Question text is required.
        </p>
      )}

      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor={`${idPrefix}-type`} className="text-sm font-medium">
            Answer type
          </label>
          <select
            id={`${idPrefix}-type`}
            value={question.answer_type}
            onChange={(event) => onChange(withAnswerType(question, event.target.value as AnswerType))}
            className={FIELD_CLASS}
          >
            {ANSWER_TYPES.map((answerType) => (
              <option key={answerType} value={answerType}>
                {ANSWER_TYPE_LABELS[answerType]}
              </option>
            ))}
          </select>
        </div>

        {question.answer_type === AnswerType.CODE && (
          <div className="flex flex-col gap-1">
            <label htmlFor={`${idPrefix}-language`} className="text-sm font-medium">
              Language
            </label>
            <select
              id={`${idPrefix}-language`}
              value={question.language ?? ""}
              onChange={(event) => onChange({ ...question, language: event.target.value })}
              className={FIELD_CLASS}
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
