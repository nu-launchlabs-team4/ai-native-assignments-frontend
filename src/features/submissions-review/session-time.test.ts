import { describe, expect, it } from "vitest";

import { Step } from "@/lib/constants";

import { formatDuration, sessionSeconds, timePerStep } from "./session-time";
import type { WorkSession } from "./session-types";

function session(segments: WorkSession["segments"]): WorkSession {
  return { id: "s", started_at: segments[0].started_at, ended_at: null, segments, events: [] };
}

const first = session([
  { step: Step.ATTEMPT, started_at: "2026-11-19T22:00:00Z", ended_at: "2026-11-19T22:25:00Z" },
  { step: Step.FEEDBACK, started_at: "2026-11-19T22:25:00Z", ended_at: "2026-11-19T22:40:00Z" },
]);
const second = session([
  { step: Step.FEEDBACK, started_at: "2026-11-20T17:40:00Z", ended_at: "2026-11-20T17:45:00Z" },
]);

describe("sessionSeconds", () => {
  it("adds up the session's segments", () => {
    expect(sessionSeconds(first)).toBe(40 * 60);
  });
});

describe("timePerStep", () => {
  it("totals each step across sessions, in step order, with zero for steps not reached", () => {
    expect(timePerStep([first, second])).toEqual([
      { step: Step.ATTEMPT, seconds: 25 * 60 },
      { step: Step.FEEDBACK, seconds: 20 * 60 },
      { step: Step.EVALUATE, seconds: 0 },
      { step: Step.REVISE, seconds: 0 },
      { step: Step.EXPLAIN, seconds: 0 },
    ]);
  });
});

describe("formatDuration", () => {
  it.each([
    [30, "under 1 min"],
    [42 * 60, "42 min"],
    [60 * 60, "1 h"],
    [65 * 60 + 20, "1 h 5 min"],
  ])("formats %i seconds as %s", (seconds, expected) => {
    expect(formatDuration(seconds)).toBe(expected);
  });
});
