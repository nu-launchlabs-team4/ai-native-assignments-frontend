"use client";

import { useSyncExternalStore } from "react";

import { formatDateTime, formatTime } from "../format";

// The browser's zone never changes while the page is open, so there's nothing to subscribe to.
const subscribe = () => () => {};
const browserTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
// The server and the first browser render agree on UTC; React then re-renders in the local zone.
const serverTimeZone = () => undefined;

interface LocalTimeProps {
  iso: string;
  /** "dateTime" (the default) shows the date too; "time" shows only the time of day. */
  show?: "dateTime" | "time";
  className?: string;
}

/** A timestamp in the professor's own time zone, such as "Nov 20, 2026, 1:30 PM EST". */
export function LocalTime({ iso, show = "dateTime", className }: LocalTimeProps) {
  const timeZone = useSyncExternalStore(subscribe, browserTimeZone, serverTimeZone);
  const text = show === "time" ? formatTime(iso, timeZone) : formatDateTime(iso, timeZone);

  return (
    <time dateTime={iso} className={className}>
      {text}
    </time>
  );
}
