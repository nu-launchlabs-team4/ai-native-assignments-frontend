import { apiFetch } from "@/lib/api";
import { API_PATHS } from "@/lib/constants";

import type { ChatMessage } from "./types";

interface SendChatMessageBody {
  submission_id: string;
  message: string;
}

/**
 * Send a student message to the AI tutor and return the tutor's reply.
 * Throws ApiError: 403 while chat is locked (attempt not saved, or during the
 * interview) and 429 when the student hits the AI rate limit.
 */
export function sendChatMessage(submissionId: string, message: string): Promise<ChatMessage> {
  const body: SendChatMessageBody = { submission_id: submissionId, message };
  return apiFetch<ChatMessage>(API_PATHS.AI_CHAT, { method: "POST", body });
}
