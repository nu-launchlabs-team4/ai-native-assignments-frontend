import type { ChatRole } from "@/lib/constants";

/** One message in the tutor conversation, as the panel shows it. */
export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  created_at: string;
}
