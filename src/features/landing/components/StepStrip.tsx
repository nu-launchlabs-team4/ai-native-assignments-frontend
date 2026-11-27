import { STEP_ORDER, Step } from "@/lib/constants";

// Longer than STEP_LABELS on purpose: here the labels describe the step to someone new.
const LANDING_STEP_LABELS: Record<Step, string> = {
  [Step.ATTEMPT]: "Attempt",
  [Step.FEEDBACK]: "Get feedback",
  [Step.EVALUATE]: "Evaluate",
  [Step.REVISE]: "Revise",
  [Step.EXPLAIN]: "Explain",
};

// The connector is drawn from each step to the next: down the left on narrow screens,
// across between circle centers from sm up.
const CONNECTOR_CLASS =
  "after:absolute after:bg-brand/40 dark:after:bg-brand/80 last:after:hidden " +
  "after:left-4 after:top-10 after:bottom-1 after:w-px after:-translate-x-1/2 " +
  "sm:after:left-[calc(50%+1.5rem)] sm:after:right-[calc(-50%+1.5rem)] sm:after:top-4 sm:after:bottom-auto " +
  "sm:after:h-px sm:after:w-auto sm:after:translate-x-0";

/** The five steps of an assignment, as a static ordered list. */
export function StepStrip() {
  return (
    <section aria-labelledby="landing-steps" className="rounded-2xl bg-brand-soft px-6 py-8 sm:px-8">
      <h2 id="landing-steps" className="sr-only">
        The five steps of an assignment
      </h2>
      <ol className="flex flex-col sm:grid sm:grid-cols-5">
        {STEP_ORDER.map((step, index) => (
          <li
            key={step}
            className={`relative flex items-center gap-4 pb-6 last:pb-0 sm:flex-col sm:gap-3 sm:pb-0 ${CONNECTOR_CLASS}`}
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-callout font-semibold text-brand-foreground">
              {index + 1}
            </span>
            <span className="text-body font-medium text-foreground sm:text-center">{LANDING_STEP_LABELS[step]}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
