import { STEP_LABELS, STEP_ORDER, type Step } from "@/lib/constants";

type StepStatus = "done" | "current" | "upcoming";

const STATUS_TEXT: Record<StepStatus, string> = {
  done: "completed",
  current: "current step",
  upcoming: "not started",
};

const ITEM_STYLE: Record<StepStatus, string> = {
  done: "text-green-700 dark:text-green-400",
  current: "rounded bg-accent px-2 py-0.5 font-medium text-accent-foreground",
  upcoming: "text-muted",
};

function statusOf(index: number, currentIndex: number): StepStatus {
  if (index < currentIndex) return "done";
  if (index === currentIndex) return "current";
  return "upcoming";
}

interface StepStepperProps {
  currentStep: Step;
}

/** Breadcrumb of the five steps showing where the student is. Display only until step navigation lands. */
export function StepStepper({ currentStep }: StepStepperProps) {
  const currentIndex = STEP_ORDER.indexOf(currentStep);

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
                <span aria-hidden="true" className="tabular-nums">
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
