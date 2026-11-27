"use client";

import { useCallback, useEffect, useId, useState } from "react";

import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Panel } from "@/components/ui/Panel";
import { ApiError } from "@/lib/api";
import { MAX_AI_DECLARATION_CHARS, MAX_INTERVIEW_ANSWER_CHARS } from "@/lib/constants";

import {
  type AiUse,
  aiDeclarationText,
  clearInterviewDraft,
  type InterviewDraft,
  loadInterviewDraft,
  OTHER_TOOLS_PREFIX,
  saveInterviewDraft,
} from "../interview";
import type { ExplanationBody } from "../submission-client";

const QUESTIONS_NOT_READY = "Your follow-up questions aren't ready yet. Try again in a moment.";

const FIELD_CLASS =
  "resize-none rounded-md border border-field bg-surface px-3 py-2 text-sm placeholder:text-muted " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:opacity-60";

type QuestionsState = { kind: "loading" } | { kind: "ready"; questions: string[] } | { kind: "error"; message: string };

interface InterviewPanelProps {
  submissionId: string;
  loadQuestions: () => Promise<string[]>;
  isSubmitting: boolean;
  submitError: string | null;
  /** Resolves to true once the submission is submitted, false if it failed. */
  onSubmit: (body: ExplanationBody) => Promise<boolean>;
}

/**
 * Step 5, in place of the AI tutor: three follow-up questions about the student's own work,
 * the AI use declaration, and the final submit. The draft is kept in this browser until then.
 */
export function InterviewPanel({ submissionId, loadQuestions, isSubmitting, submitError, onSubmit }: InterviewPanelProps) {
  const [questionsState, setQuestionsState] = useState<QuestionsState>({ kind: "loading" });
  const [draft, setDraft] = useState<InterviewDraft>(() => loadInterviewDraft(submissionId));
  const [confirming, setConfirming] = useState(false);
  const otherToolsId = useId();

  const load = useCallback(async (): Promise<QuestionsState> => {
    try {
      return { kind: "ready", questions: await loadQuestions() };
    } catch (caught) {
      // A 404 means the questions haven't been generated yet (backend #11).
      const notReady = caught instanceof ApiError && (caught.status === 404 || caught.status === 405);
      return { kind: "error", message: notReady || !(caught instanceof ApiError) ? QUESTIONS_NOT_READY : caught.message };
    }
  }, [loadQuestions]);

  useEffect(() => {
    let cancelled = false;
    load().then((next) => {
      if (!cancelled) setQuestionsState(next);
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  function update(next: InterviewDraft) {
    setDraft(next);
    saveInterviewDraft(submissionId, next);
  }

  function setAnswer(index: number, value: string) {
    const answers = [...draft.answers];
    answers[index] = value;
    update({ ...draft, answers });
  }

  const questions = questionsState.kind === "ready" ? questionsState.questions : [];
  const declaration = aiDeclarationText(draft.aiUse, draft.otherTools);
  const allAnswered = questions.length > 0 && questions.every((_, index) => (draft.answers[index] ?? "").trim() !== "");
  const canSubmit = allAnswered && declaration !== null && !isSubmitting;

  async function submit() {
    if (!declaration) return;
    const submitted = await onSubmit({
      interview_answers: questions.map((question, index) => ({ question, answer: (draft.answers[index] ?? "").trim() })),
      ai_declaration: declaration,
    });
    // On success the workspace replaces this panel with the summary; on failure the draft
    // stays and the error shows, so nothing is lost.
    if (submitted) clearInterviewDraft(submissionId);
    else setConfirming(false);
  }

  return (
    <Panel title="Follow-up questions" headingId="workspace-ai" bodyClassName="flex flex-col gap-5 p-4">
      <p className="text-sm text-muted">
        Answer in your own words. The AI tutor is closed for this step, and your professor reads these with your work.
      </p>

      {questionsState.kind === "loading" && (
        <div className="flex flex-col gap-3">
          <p role="status" className="sr-only">
            Loading your follow-up questions…
          </p>
          <div className="h-20 rounded bg-fill motion-safe:animate-pulse" />
          <div className="h-20 rounded bg-fill motion-safe:animate-pulse" />
        </div>
      )}

      {questionsState.kind === "error" && (
        <div role="alert" className="flex flex-col items-start gap-3">
          <p className="text-sm">{questionsState.message}</p>
          <Button
            variant="tinted"
            size="small"
            onClick={async () => {
              setQuestionsState({ kind: "loading" });
              setQuestionsState(await load());
            }}
          >
            Try again
          </Button>
        </div>
      )}

      {questions.map((question, index) => (
        <InterviewQuestion
          key={question}
          number={index + 1}
          question={question}
          value={draft.answers[index] ?? ""}
          disabled={isSubmitting}
          onChange={(value) => setAnswer(index, value)}
        />
      ))}

      {questions.length > 0 && (
        <fieldset disabled={isSubmitting} className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-semibold">Which AI did you use for this assignment?</legend>
          <AiUseOption
            value="tutor-only"
            label="Only this app's AI tutor"
            checked={draft.aiUse === "tutor-only"}
            onSelect={(aiUse) => update({ ...draft, aiUse })}
          />
          <AiUseOption
            value="other-tools"
            label="I also used other AI tools"
            checked={draft.aiUse === "other-tools"}
            onSelect={(aiUse) => update({ ...draft, aiUse })}
          />
          {draft.aiUse === "other-tools" && (
            <div className="flex flex-col gap-1 pl-6">
              <label htmlFor={otherToolsId} className="text-sm font-medium">
                Which tools, and what did you use them for?
              </label>
              <textarea
                id={otherToolsId}
                value={draft.otherTools}
                onChange={(event) => update({ ...draft, otherTools: event.target.value })}
                maxLength={MAX_AI_DECLARATION_CHARS - OTHER_TOOLS_PREFIX.length}
                rows={3}
                aria-required="true"
                placeholder="For example: I asked ChatGPT what Big-O notation means."
                className={FIELD_CLASS}
              />
            </div>
          )}
        </fieldset>
      )}

      {submitError && (
        <ErrorMessage role="alert" className="text-sm">
          {submitError}
        </ErrorMessage>
      )}

      {questions.length > 0 &&
        (confirming ? (
          <div className="flex flex-col gap-3 rounded-md border border-field p-3">
            <p className="text-sm font-medium">You can&apos;t change your work after this. Submit the assignment?</p>
            <div className="flex gap-2">
              <Button variant="plain" onClick={() => setConfirming(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={submit} disabled={isSubmitting} className="flex-1">
                {isSubmitting ? "Submitting…" : "Submit"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <Button onClick={() => setConfirming(true)} disabled={!canSubmit} className="w-full">
              Submit assignment
            </Button>
            {!canSubmit && (
              <p className="text-xs text-muted">Answer every question and say which AI you used to submit.</p>
            )}
          </div>
        ))}
    </Panel>
  );
}

interface InterviewQuestionProps {
  number: number;
  question: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}

function InterviewQuestion({ number, question, value, disabled, onChange }: InterviewQuestionProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium">
        {number}. {question}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={MAX_INTERVIEW_ANSWER_CHARS}
        rows={4}
        disabled={disabled}
        aria-required="true"
        className={FIELD_CLASS}
      />
    </div>
  );
}

interface AiUseOptionProps {
  value: AiUse;
  label: string;
  checked: boolean;
  onSelect: (value: AiUse) => void;
}

function AiUseOption({ value, label, checked, onSelect }: AiUseOptionProps) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm pointer-coarse:min-h-11">
      <input
        type="radio"
        name="ai-use"
        value={value}
        checked={checked}
        onChange={() => onSelect(value)}
        className="size-4 accent-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      />
      {label}
    </label>
  );
}
