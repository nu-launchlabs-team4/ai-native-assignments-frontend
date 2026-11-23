// The setup page edits the backend's own shapes, so these are the shared API types
// from src/lib/api-types.ts under the names this feature already uses.
export type {
  AssignmentOut as SetupAssignment,
  AssignmentSettings,
  QuestionOut as SetupQuestion,
} from "@/lib/api-types";
