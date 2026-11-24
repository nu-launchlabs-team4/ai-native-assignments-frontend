import type { SaveStatus } from "../use-answers";

function saveStatusText(status: SaveStatus, lastSavedAt: Date | null): string {
  switch (status) {
    case "saving":
      return "Saving…";
    case "unsaved":
      return "Unsaved changes. Saving automatically.";
    case "error":
      return "Couldn't save. Retrying…";
    case "saved":
      return lastSavedAt
        ? `Saved at ${lastSavedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
        : "All changes saved";
  }
}

/** Autosave progress, read out politely by screen readers. */
export function SaveStatusLine({ status, lastSavedAt }: { status: SaveStatus; lastSavedAt: Date | null }) {
  return (
    <p role="status" aria-live="polite" className="text-xs text-muted">
      {saveStatusText(status, lastSavedAt)}
    </p>
  );
}
