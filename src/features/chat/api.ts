import { apiFetch } from "@/lib/api";
import { API_PATHS, ChatRole } from "@/lib/constants";

import type { ChatMessage } from "./types";

/** The backend's ChatHistoryOut (app/ai/schemas.py): the conversation, oldest first. */
interface ChatHistoryResponse {
  messages: { id: string; role: "student" | "assistant"; content: string; created_at: string }[];
}

/** The backend's ChatResponse (app/ai/schemas.py): the stored reply's id and its text. */
interface ChatResponse {
  message_id: string;
  reply: string;
}

/**
 * Send a student message to the AI tutor and return the tutor's reply.
 * Throws ApiError: 403 while chat is locked (outside the feedback, evaluate and
 * revise steps), 429 when the student hits the AI rate limit, and 503 when the
 * tutor is unavailable.
 */
export async function sendChatMessage(submissionId: string, message: string): Promise<ChatMessage> {
  const path = `${API_PATHS.AI_SUBMISSIONS}/${encodeURIComponent(submissionId)}/chat`;
  const response = await apiFetch<ChatResponse>(path, { method: "POST", body: { message } });
  return {
    id: response.message_id,
    role: ChatRole.ASSISTANT,
    content: response.reply,
    // The backend doesn't send the time, and the reply has just arrived.
    created_at: new Date().toISOString(),
  };
}

/** The conversation so far, oldest first, so the panel can show it after a reload. */
export async function loadChatHistory(submissionId: string): Promise<ChatMessage[]> {
  const path = `${API_PATHS.AI_SUBMISSIONS}/${encodeURIComponent(submissionId)}/chat`;
  const response = await apiFetch<ChatHistoryResponse>(path);
  return response.messages.map((message) => ({
    id: message.id,
    role: message.role === "student" ? ChatRole.STUDENT : ChatRole.ASSISTANT,
    content: message.content,
    created_at: message.created_at,
  }));
}
