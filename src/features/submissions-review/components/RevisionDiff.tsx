import { DiffLineType, diffLines } from "../diff";
import type { RevisedAnswer } from "../types";

/** What changed in each answer between the attempt and the revision, line by line. */
export function RevisionDiff({ answers }: { answers: readonly RevisedAnswer[] }) {
  return (
    <div className="flex flex-col gap-3">
      {answers.map((answer) => (
        <figure key={answer.question_number} className="flex flex-col gap-1">
          <figcaption className="text-xs font-medium text-muted">Question {answer.question_number}</figcaption>
          <pre className="overflow-x-auto rounded border border-line bg-surface-muted p-3 font-mono text-xs leading-5">
            {diffLines(answer.before, answer.after).map((line, index) => {
              // <ins> and <del> tell screen readers what changed; the +/- prefix shows it visually.
              if (line.type === DiffLineType.ADDED) {
                return (
                  <ins key={index} className="block font-semibold no-underline">
                    + {line.text}
                  </ins>
                );
              }
              if (line.type === DiffLineType.REMOVED) {
                return (
                  <del key={index} className="block text-muted">
                    - {line.text}
                  </del>
                );
              }
              return (
                <span key={index} className="block">
                  {"  "}
                  {line.text}
                </span>
              );
            })}
          </pre>
        </figure>
      ))}
    </div>
  );
}
