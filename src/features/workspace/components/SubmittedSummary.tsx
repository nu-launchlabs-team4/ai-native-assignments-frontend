import { Panel } from "@/components/ui/Panel";
import type { InterviewAnswer } from "@/lib/api-types";

const DATE_TIME = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

interface SubmittedSummaryProps {
  submittedAt: string | null;
  interviewAnswers: InterviewAnswer[] | null;
  aiDeclaration: string | null;
}

/** After step 5: what the student handed in with their work, read-only. */
export function SubmittedSummary({ submittedAt, interviewAnswers, aiDeclaration }: SubmittedSummaryProps) {
  return (
    <Panel title="Your submission" headingId="workspace-ai" bodyClassName="flex flex-col gap-5 p-4">
      <p role="status" className="text-sm">
        <span aria-hidden="true" className="text-success">
          ✓{" "}
        </span>
        Submitted{submittedAt ? ` on ${DATE_TIME.format(new Date(submittedAt))}` : ""}. Your professor can now review your
        work.
      </p>
      {interviewAnswers && interviewAnswers.length > 0 && (
        <section aria-labelledby="summary-interview" className="flex flex-col gap-3">
          <h3 id="summary-interview" className="text-sm font-semibold">
            Your follow-up answers
          </h3>
          <ol className="flex flex-col gap-3">
            {interviewAnswers.map((item, index) => (
              <li key={item.question} className="flex flex-col gap-1">
                <p className="text-sm font-medium">
                  {index + 1}. {item.question}
                </p>
                <p className="whitespace-pre-wrap text-sm text-muted">{item.answer}</p>
              </li>
            ))}
          </ol>
        </section>
      )}
      {aiDeclaration && (
        <section aria-labelledby="summary-ai-use" className="flex flex-col gap-1">
          <h3 id="summary-ai-use" className="text-sm font-semibold">
            AI use
          </h3>
          <p className="whitespace-pre-wrap text-sm text-muted">{aiDeclaration}</p>
        </section>
      )}
    </Panel>
  );
}
