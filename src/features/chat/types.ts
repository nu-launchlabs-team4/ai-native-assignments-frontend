import type { ChatRole } from "@/lib/constants";

/** One message in the tutor conversation, as the backend returns it. */
export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  created_at: string;
}
