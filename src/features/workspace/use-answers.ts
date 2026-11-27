"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ApiError } from "@/lib/api";
import type { AnswerMap, SubmissionOut } from "@/lib/api-types";
import { AUTOSAVE_INTERVAL_MS, type EvaluationVerdict, Step } from "@/lib/constants";

import { initialAnswers, showsRevision } from "./map-submission";
import type { ExplanationBody, SubmissionClient } from "./submission-client";
import type { Answers } from "./types";

export type SaveStatus = "saved" | "saving" | "unsaved" | "error";

const SAVE_FAILED_MESSAGE = "Couldn't save your answers. Check your connection and try again.";
const SUBMIT_FAILED_MESSAGE = "Couldn't submit. Check your connection and try again.";

/** Answers that differ from what the backend last confirmed. */
function changedAnswers(answers: Answers, saved: Answers): AnswerMap {
  return Object.fromEntries(Object.entries(answers).filter(([id, value]) => saved[id] !== value));
}

/** What the backend has saved for the step's answers. Starter code isn't saved yet, so it counts as a change. */
function savedAnswersFor(submission: SubmissionOut): Answers {
  return { ...(showsRevision(submission.current_step) ? submission.revision_answers : submission.attempt_answers) };
}

/** The steps whose answers the student edits: the attempt (1) and the revision (4). */
function isEditableStep(step: Step): boolean {
  return step === Step.ATTEMPT || step === Step.REVISE;
}

/**
 * The submission's answers and how it moves through the steps: autosave every
 * 30 seconds (sending only changed questions) while the attempt or the revision
 * is open, submitting the attempt, judging the AI feedback, and handing in the revision.
 */
export function useAnswers(client: SubmissionClient, initialSubmission: SubmissionOut) {
  const [submission, setSubmission] = useState(initialSubmission);
  const [answers, setAnswers] = useState<Answers>(() => initialAnswers(initialSubmission));
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Refs let the timer and async saves see the latest values without re-subscribing.
  const answersRef = useRef<Answers>(answers);
  const savedRef = useRef<Answers>(savedAnswersFor(initialSubmission));
  const inFlightRef = useRef<Promise<boolean> | null>(null);

  const submissionId = submission.id;
  const step = submission.current_step;
  const isEditable = isEditableStep(step);

  /** Send the step's answers to the right endpoint: the attempt's or the revision's. */
  const sendAnswers = useCallback(
    (changed: AnswerMap, options?: { keepalive?: boolean }) =>
      step === Step.REVISE
        ? client.saveRevisionAnswers(submissionId, changed, options)
        : client.saveAttemptAnswers(submissionId, changed, options),
    [client, step, submissionId],
  );

  /** Save every changed answer. Resolves to false if the save failed. */
  const save = useCallback(async (): Promise<boolean> => {
    // One save at a time. Edits made meanwhile stay changed and go in the next save.
    while (inFlightRef.current) {
      await inFlightRef.current;
    }
    const changed = changedAnswers(answersRef.current, savedRef.current);
    if (Object.keys(changed).length === 0) {
      return true;
    }
    setSaveStatus("saving");
    const request = sendAnswers(changed)
      .then(() => {
        savedRef.current = { ...savedRef.current, ...changed };
        setLastSavedAt(new Date());
        const stillChanged = Object.keys(changedAnswers(answersRef.current, savedRef.current)).length;
        setSaveStatus(stillChanged ? "unsaved" : "saved");
        return true;
      })
      .catch(() => {
        setSaveStatus("error");
        return false;
      })
      .finally(() => {
        inFlightRef.current = null;
      });
    inFlightRef.current = request;
    return request;
  }, [sendAnswers]);

  const setAnswer = useCallback((questionId: string, value: string) => {
    answersRef.current = { ...answersRef.current, [questionId]: value };
    setAnswers(answersRef.current);
    setSaveStatus((current) => (current === "saving" ? current : "unsaved"));
  }, []);

  // Autosave while the attempt or the revision is open. A failed save is retried on the next tick.
  useEffect(() => {
    if (!isEditable) return;
    const timer = setInterval(() => void save(), AUTOSAVE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [isEditable, save]);

  // Closing or leaving the tab: send what's left without waiting for the timer.
  useEffect(() => {
    if (!isEditable) return;
    function saveOnLeave() {
      const changed = changedAnswers(answersRef.current, savedRef.current);
      if (Object.keys(changed).length > 0) {
        void sendAnswers(changed, { keepalive: true });
      }
    }
    window.addEventListener("pagehide", saveOnLeave);
    return () => window.removeEventListener("pagehide", saveOnLeave);
  }, [isEditable, sendAnswers]);

  /** Move to the submission the backend returned, and show the answers its step uses. */
  const moveTo = useCallback((updated: SubmissionOut) => {
    setSubmission(updated);
    const next = initialAnswers(updated);
    answersRef.current = next;
    savedRef.current = savedAnswersFor(updated);
    setAnswers(next);
    setSaveStatus("saved");
  }, []);

  /** Run a step action, saving changed answers first when the step has them. Resolves to whether it worked. */
  const submit = useCallback(
    async (action: () => Promise<SubmissionOut>, saveFirst: boolean): Promise<boolean> => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        if (saveFirst && !(await save())) {
          setSubmitError(SAVE_FAILED_MESSAGE);
          return false;
        }
        moveTo(await action());
        return true;
      } catch (error) {
        setSubmitError(error instanceof ApiError ? error.message : SUBMIT_FAILED_MESSAGE);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [moveTo, save],
  );

  /** Step 1: save any changes, then submit the attempt with the confidence and approach note. */
  const finishAttempt = useCallback(
    (confidence: number, approachNote: string) =>
      submit(
        () => client.finishAttempt(submissionId, { confidence, approach_note: approachNote.trim() }),
        true,
      ),
    [client, submit, submissionId],
  );

  /** Step 3: judge the AI feedback. The backend starts the revision as a copy of the attempt. */
  const submitEvaluation = useCallback(
    (verdict: EvaluationVerdict, testCase: string) =>
      submit(() => client.saveEvaluation(submissionId, { verdict, test_case: testCase.trim() }), false),
    [client, submit, submissionId],
  );

  /** Step 4: save any changes, then hand in the revision. */
  const finishRevision = useCallback(
    () => submit(() => client.finishRevision(submissionId), true),
    [client, submit, submissionId],
  );

  /** Step 5: answer the follow-up questions and declare AI use, which submits the submission. */
  const submitExplanation = useCallback(
    (body: ExplanationBody) => submit(() => client.saveExplanation(submissionId, body), false),
    [client, submit, submissionId],
  );

  /** Pausing: save the open step's changes now. Resolves to false if the save failed. */
  const saveNow = useCallback(() => (isEditable ? save() : Promise.resolve(true)), [isEditable, save]);

  return {
    submission,
    answers,
    setAnswer,
    saveStatus,
    lastSavedAt,
    isSubmitting,
    submitError,
    finishAttempt,
    submitEvaluation,
    finishRevision,
    submitExplanation,
    saveNow,
  };
}
