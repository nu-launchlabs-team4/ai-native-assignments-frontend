// Step 5 helpers: the AI use declaration, and a browser-only draft of the interview,
// because the backend saves step 5 only when it's submitted.

export type AiUse = "tutor-only" | "other-tools";

export interface InterviewDraft {
  answers: string[];
  aiUse: AiUse | null;
  /** Which other AI tools, and what for. Only used with "other-tools". */
  otherTools: string;
}

export const EMPTY_DRAFT: InterviewDraft = { answers: [], aiUse: null, otherTools: "" };

const TUTOR_ONLY_TEXT = "Used only this app's AI tutor.";
/** Starts the declaration when other tools were used. The details follow it. */
export const OTHER_TOOLS_PREFIX = "Also used other AI tools: ";

/** The declaration as one readable sentence, or null while it's incomplete. */
export function aiDeclarationText(aiUse: AiUse | null, otherTools: string): string | null {
  if (aiUse === "tutor-only") return TUTOR_ONLY_TEXT;
  if (aiUse === "other-tools" && otherTools.trim()) return `${OTHER_TOOLS_PREFIX}${otherTools.trim()}`;
  return null;
}

function draftKey(submissionId: string): string {
  return `interview-draft:${submissionId}`;
}

// Storage can be missing or blocked (private windows, previews), so every access is guarded
// and the page works without it.

/** The saved draft for a submission, or an empty one. */
export function loadInterviewDraft(submissionId: string): InterviewDraft {
  try {
    const raw = window.localStorage.getItem(draftKey(submissionId));
    if (!raw) return EMPTY_DRAFT;
    const parsed = JSON.parse(raw) as Partial<InterviewDraft>;
    return {
      answers: Array.isArray(parsed.answers) ? parsed.answers.map(String) : [],
      aiUse: parsed.aiUse === "tutor-only" || parsed.aiUse === "other-tools" ? parsed.aiUse : null,
      otherTools: typeof parsed.otherTools === "string" ? parsed.otherTools : "",
    };
  } catch {
    return EMPTY_DRAFT;
  }
}

/** Keep the draft in this browser until the interview is submitted. */
export function saveInterviewDraft(submissionId: string, draft: InterviewDraft): void {
  try {
    window.localStorage.setItem(draftKey(submissionId), JSON.stringify(draft));
  } catch {
    // Without storage the draft just isn't kept across reloads.
  }
}

/** Forget the draft once the interview is submitted. */
export function clearInterviewDraft(submissionId: string): void {
  try {
    window.localStorage.removeItem(draftKey(submissionId));
  } catch {
    // Nothing to clear.
  }
}
