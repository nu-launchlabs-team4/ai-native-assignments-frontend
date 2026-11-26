/** Step 5, under the question list: where to go, or that the work is handed in. */
export function ExplainStepNote({ submitted }: { submitted: boolean }) {
  return (
    <section aria-labelledby="explain-step" className="border-t border-line p-4">
      <h3 id="explain-step" className="text-sm font-semibold">
        {submitted ? "Submitted" : "Explain your work"}
      </h3>
      <p className="mt-1 text-sm text-muted">
        {submitted
          ? "Your attempt, revision and answers are saved. Your professor can now review your work."
          : "Answer the follow-up questions on the right. The AI tutor is closed for this step."}
      </p>
    </section>
  );
}
