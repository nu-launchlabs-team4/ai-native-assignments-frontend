import { STEP_LABELS, STEP_ORDER, type Step } from "@/lib/constants";

type StepStatus = "done" | "current" | "upcoming";

const STATUS_TEXT: Record<StepStatus, string> = {
  done: "completed",
  current: "current step",
  upcoming: "not started",
};

const NUMBER_STYLE: Record<StepStatus, string> = {
  done: "border-green-600 bg-green-600 text-white",
  current: "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900",
  upcoming: "border-zinc-300 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400",
};

function statusOf(index: number, currentIndex: number): StepStatus {
  if (index < currentIndex) return "done";
  if (index === currentIndex) return "current";
  return "upcoming";
}

interface StepStepperProps {
  currentStep: Step;
}

/** Shows the five steps and where the student is. Display only until step navigation lands. */
export function StepStepper({ currentStep }: StepStepperProps) {
  const currentIndex = STEP_ORDER.indexOf(currentStep);

  return (
    <nav aria-label="Assignment steps" className="overflow-x-auto">
      <ol className="flex items-center gap-2 text-sm">
        {STEP_ORDER.map((step, index) => {
          const status = statusOf(index, currentIndex);
          return (
            <li
              key={step}
              aria-current={status === "current" ? "step" : undefined}
              className="flex shrink-0 items-center gap-2"
            >
              {index > 0 && (
                <span aria-hidden="true" className="h-px w-4 bg-zinc-300 dark:bg-zinc-700" />
              )}
              <span
                aria-hidden="true"
                className={`flex size-6 items-center justify-center rounded-full border text-xs font-semibold ${NUMBER_STYLE[status]}`}
              >
                {index + 1}
              </span>
              <span className={status === "current" ? "font-semibold" : "text-zinc-600 dark:text-zinc-400"}>
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
