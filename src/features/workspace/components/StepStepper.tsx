import { STEP_LABELS, STEP_ORDER, type Step } from "@/lib/constants";

type StepStatus = "done" | "current" | "upcoming";

const STATUS_TEXT: Record<StepStatus, string> = {
  done: "completed",
  current: "current step",
  upcoming: "not started",
};

const ITEM_STYLE: Record<StepStatus, string> = {
  done: "text-success",
  // Northeastern red marks where the student is.
  current: "rounded bg-brand px-2 py-0.5 font-medium text-brand-foreground",
  upcoming: "text-muted",
};

function statusOf(index: number, currentIndex: number): StepStatus {
  if (index < currentIndex) return "done";
  if (index === currentIndex) return "current";
  return "upcoming";
}

interface StepStepperProps {
  currentStep: Step;
  /** The submission is handed in, so every step, the last one included, is done. */
  complete?: boolean;
}

/** Breadcrumb of the five steps showing where the student is. Display only until step navigation lands. */
export function StepStepper({ currentStep, complete = false }: StepStepperProps) {
  const currentIndex = complete ? STEP_ORDER.length : STEP_ORDER.indexOf(currentStep);

  return (
    <nav aria-label="Assignment steps" className="min-w-0 overflow-x-auto">
      <ol className="flex items-center gap-1.5 text-sm">
        {STEP_ORDER.map((step, index) => {
          const status = statusOf(index, currentIndex);
          return (
            <li
              key={step}
              aria-current={status === "current" ? "step" : undefined}
              className="flex shrink-0 items-center gap-1.5"
            >
              {index > 0 && (
                <span aria-hidden="true" className="text-muted">
                  ›
                </span>
              )}
              <span className={`flex items-center gap-1 ${ITEM_STYLE[status]}`}>
                <span aria-hidden="true" className={`tabular-nums ${status === "upcoming" ? "text-brand-text" : ""}`}>
                  {status === "done" ? "✓" : `${index + 1}`}
                </span>
                {STEP_LABELS[step]}
              </span>
              <span className="sr-only">({STATUS_TEXT[status]})</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
