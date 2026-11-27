// The server renders in UTC (it can't know the professor's zone); LocalTime switches to the
// professor's own zone in the browser. Every time shows its zone, so neither is ambiguous.
const SERVER_TIME_ZONE = "UTC";

const DATE_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZoneName: "short",
};

const TIME_OPTIONS: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit", timeZoneName: "short" };

/** Format an ISO timestamp with its zone, such as "Nov 20, 2026, 6:30 PM UTC" or "…, 1:30 PM EST". */
export function formatDateTime(iso: string, timeZone: string = SERVER_TIME_ZONE): string {
  return new Intl.DateTimeFormat("en-US", { ...DATE_TIME_OPTIONS, timeZone }).format(new Date(iso));
}

/** Format an ISO timestamp as a time of day with its zone, such as "6:30 PM UTC". */
export function formatTime(iso: string, timeZone: string = SERVER_TIME_ZONE): string {
  return new Intl.DateTimeFormat("en-US", { ...TIME_OPTIONS, timeZone }).format(new Date(iso));
}
