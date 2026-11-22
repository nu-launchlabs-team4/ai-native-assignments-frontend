// A fixed time zone keeps the server render and tests stable.
// TODO(dineshbachchani1234): show the professor's own time zone once we store it (#11).
const DATE_TIME = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

/** Format an ISO timestamp for display, such as "Nov 20, 2026, 6:30 PM UTC". */
export function formatDateTime(iso: string): string {
  return `${DATE_TIME.format(new Date(iso))} UTC`;
}
