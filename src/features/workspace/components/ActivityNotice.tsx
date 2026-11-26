import { Button } from "@/components/ui/Button";

interface ActivityNoticeProps {
  onDismiss: () => void;
}

/** Tells the student, before they work, exactly what their professor will see. */
export function ActivityNotice({ onDismiss }: ActivityNoticeProps) {
  return (
    <aside
      aria-labelledby="activity-notice"
      className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-b border-line bg-surface-muted px-4 py-2 text-sm"
    >
      <p className="min-w-0 flex-1">
        <span id="activity-notice" className="font-semibold">
          What your professor sees:{" "}
        </span>
        <span className="text-muted">
          when you paste (only how many characters, never the text), when you leave or come back to this
          tab, and each saved version of your answers. Nothing else is recorded.
        </span>
      </p>
      <Button variant="plain" size="small" onClick={onDismiss}>
        Got it
      </Button>
    </aside>
  );
}
