import { STEP_LABELS } from "@/lib/constants";

import { formatDuration, timePerStep } from "../session-time";
import type { WorkSession } from "../session-types";

/** Total time in each of the five steps across all sessions. */
export function TimePerStep({ sessions }: { sessions: readonly WorkSession[] }) {
  const rows = timePerStep(sessions);
  const total = rows.reduce((sum, row) => sum + row.seconds, 0);

  return (
    <table className="w-full max-w-md text-left text-sm">
      <caption className="sr-only">Time per step</caption>
      <thead>
        <tr className="border-b border-line text-muted">
          <th scope="col" className="py-2 font-medium">
            Step
          </th>
          <th scope="col" className="py-2 text-right font-medium">
            Time
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ step, seconds }) => (
          <tr key={step} className="border-b border-line">
            <th scope="row" className="py-2 font-normal">
              {STEP_LABELS[step]}
            </th>
            <td className="py-2 text-right">
              {seconds > 0 ? formatDuration(seconds) : <span className="text-muted">Not reached</span>}
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <th scope="row" className="py-2 font-semibold">
            Total
          </th>
          <td className="py-2 text-right font-semibold">{formatDuration(total)}</td>
        </tr>
      </tfoot>
    </table>
  );
}
