import type { Step } from "@/lib/constants";

/** What the workspace needs to show one assignment. Replaced by the backend schema in BE#9. */
export interface WorkspaceAssignment {
  id: string;
  title: string;
  /** Paragraphs of the task description, in order. */
  instructions: readonly string[];
  /** Monaco language id, such as "python". */
  language: string;
  starterCode: string;
  currentStep: Step;
}
