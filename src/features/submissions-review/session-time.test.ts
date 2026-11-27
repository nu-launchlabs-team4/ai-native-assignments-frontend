import { describe, expect, it } from "vitest";

import { Step } from "@/lib/constants";

import { formatDuration, sessionSeconds, timePerStep } from "./session-time";
import type { StepSegment, WorkSession } from "./session-types";

function segment(step: Step, startedAt: string, endedAt: string): StepSegment {
  return { step, started_at: startedAt, ended_at: endedAt };
}

// The backend sends the segments; the events don't affect the totals.
const first: WorkSession = {
  id: "s1",
  started_at: "2026-11-19T22:00:00Z",
  ended_at: "2026-11-19T22:40:00Z",
  segments: [
    segment(Step.ATTEMPT, "2026-11-19T22:00:00Z", "2026-11-19T22:25:00Z"),
    segment(Step.FEEDBACK, "2026-11-19T22:25:00Z", "2026-11-19T22:40:00Z"),
  ],
  events: [],
};
const second: WorkSession = {
  id: "s2",
  started_at: "2026-11-20T17:40:00Z",
  ended_at: "2026-11-20T17:45:00Z",
  segments: [segment(Step.FEEDBACK, "2026-11-20T17:40:00Z", "2026-11-20T17:45:00Z")],
  events: [],
};

describe("sessionSeconds", () => {
  it("adds up the session's step segments", () => {
    expect(sessionSeconds(first)).toBe(40 * 60);
  });

  it("is zero before the first event, when there are no segments", () => {
    expect(sessionSeconds({ ...first, ended_at: null, segments: [] })).toBe(0);
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
