import type { TrailEntry } from "../types";
import { TrailEntryView } from "./TrailEntryView";

/** Everything the student and the AI did, oldest first. */
export function TrailTimeline({ entries }: { entries: readonly TrailEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-muted">No work saved yet. Entries appear here as the student works.</p>;
  }

  return (
    <ol aria-label="Trail, oldest first" className="flex flex-col gap-3">
      {entries.map((entry) => (
        <li key={entry.id}>
          <TrailEntryView entry={entry} />
        </li>
      ))}
    </ol>
  );
}
