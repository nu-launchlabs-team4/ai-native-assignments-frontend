import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/PagePlaceholder";
import { Step } from "@/lib/constants";

export const metadata: Metadata = { title: "Student" };

const STEP_LABELS: Record<Step, string> = {
  [Step.ATTEMPT]: "Attempt",
  [Step.FEEDBACK]: "Feedback",
  [Step.EVALUATE]: "Evaluate",
  [Step.REVISE]: "Revise",
  [Step.EXPLAIN]: "Explain",
};

export default function StudentPage() {
  return (
    <PagePlaceholder
      title="Student workspace"
      description="The five-step workspace with the editor and AI tutor arrives in issue #5."
    >
      <ol className="list-inside list-decimal text-zinc-700 dark:text-zinc-300">
        {Object.values(Step).map((step) => (
          <li key={step}>{STEP_LABELS[step]}</li>
        ))}
      </ol>
    </PagePlaceholder>
  );
}
