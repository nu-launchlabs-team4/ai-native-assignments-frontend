"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ApiError } from "@/lib/api";
import type { AnswerMap, SubmissionOut } from "@/lib/api-types";
import { AUTOSAVE_INTERVAL_MS, Step } from "@/lib/constants";

import { initialAnswers } from "./map-submission";
import type { SubmissionClient } from "./submission-client";
import type { Answers } from "./types";

export type SaveStatus = "saved" | "saving" | "unsaved" | "error";

const SAVE_FAILED_MESSAGE = "Couldn't save your answers. Check your connection and try again.";

/** Answers that differ from what the backend last confirmed. */
function changedAnswers(answers: Answers, saved: Answers): AnswerMap {
  return Object.fromEntries(Object.entries(answers).filter(([id, value]) => saved[id] !== value));
}

/**
 * Step 1 state for one submission: the answers, autosave every 30 seconds
 * (sending only changed questions), and submitting the attempt.
 */
export function useAttempt(client: SubmissionClient, initialSubmission: SubmissionOut) {
  const [submission, setSubmission] = useState(initialSubmission);
  const [answers, setAnswers] = useState<Answers>(() => initialAnswers(initialSubmission));
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);

  // Refs let the timer and async saves see the latest values without re-subscribing.
  const answersRef = useRef<Answers>(answers);
  // What the backend has confirmed. Starter code isn't saved yet, so it counts as a change.
  const savedRef = useRef<Answers>({ ...initialSubmission.attempt_answers });
  const inFlightRef = useRef<Promise<boolean> | null>(null);

  const submissionId = submission.id;
  const isAttemptStep = submission.current_step === Step.ATTEMPT;

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
    const request = client
      .saveAttemptAnswers(submissionId, changed)
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
  }, [client, submissionId]);

  const setAnswer = useCallback((questionId: string, value: string) => {
    answersRef.current = { ...answersRef.current, [questionId]: value };
    setAnswers(answersRef.current);
    setSaveStatus((current) => (current === "saving" ? current : "unsaved"));
  }, []);

  // Autosave while the attempt is open. A failed save is retried on the next tick.
  useEffect(() => {
    if (!isAttemptStep) return;
    const timer = setInterval(() => void save(), AUTOSAVE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [isAttemptStep, save]);

  // Closing or leaving the tab: send what's left without waiting for the timer.
  useEffect(() => {
    if (!isAttemptStep) return;
    function saveOnLeave() {
      const changed = changedAnswers(answersRef.current, savedRef.current);
      if (Object.keys(changed).length > 0) {
        void client.saveAttemptAnswers(submissionId, changed, { keepalive: true });
      }
    }
    window.addEventListener("pagehide", saveOnLeave);
    return () => window.removeEventListener("pagehide", saveOnLeave);
  }, [client, isAttemptStep, submissionId]);

  /** Save any changes, then submit the attempt with the confidence and approach note. */
  const finish = useCallback(
    async (confidence: number, approachNote: string) => {
      setIsFinishing(true);
      setFinishError(null);
      try {
        if (!(await save())) {
          setFinishError(SAVE_FAILED_MESSAGE);
          return;
        }
        const updated = await client.finishAttempt(submissionId, {
          confidence,
          approach_note: approachNote.trim(),
        });
        setSubmission(updated);
      } catch (error) {
        setFinishError(error instanceof ApiError ? error.message : SAVE_FAILED_MESSAGE);
      } finally {
        setIsFinishing(false);
      }
    },
    [client, save, submissionId],
  );

  return { submission, answers, setAnswer, saveStatus, lastSavedAt, isFinishing, finishError, finish };
}
