import { describe, expect, it } from "vitest";

import { Step } from "@/lib/constants";

import { formatDuration, sessionSeconds, sessionSegments, timePerStep } from "./session-time";
import { ActivityEventType, type WorkSession } from "./session-types";

let nextId = 0;
function snapshot(step: Step, occurredAt: string): WorkSession["events"][number] {
  nextId += 1;
  return { id: `e${nextId}`, type: ActivityEventType.SNAPSHOT, step, occurred_at: occurredAt };
}

const first: WorkSession = {
  id: "s1",
  started_at: "2026-11-19T22:00:00Z",
  ended_at: "2026-11-19T22:40:00Z",
  events: [
    snapshot(Step.ATTEMPT, "2026-11-19T22:05:00Z"),
    snapshot(Step.ATTEMPT, "2026-11-19T22:20:00Z"),
    snapshot(Step.FEEDBACK, "2026-11-19T22:25:00Z"),
  ],
};
const second: WorkSession = {
  id: "s2",
  started_at: "2026-11-20T17:40:00Z",
  ended_at: "2026-11-20T17:45:00Z",
  events: [snapshot(Step.FEEDBACK, "2026-11-20T17:41:00Z")],
};

describe("sessionSegments", () => {
  it("starts at the session, switches step at the new step's first event and ends with the session", () => {
    expect(sessionSegments(first)).toEqual([
      { step: Step.ATTEMPT, started_at: "2026-11-19T22:00:00Z", ended_at: "2026-11-19T22:25:00Z" },
      { step: Step.FEEDBACK, started_at: "2026-11-19T22:25:00Z", ended_at: "2026-11-19T22:40:00Z" },
    ]);
  });

  it("ends an open session at its latest event", () => {
    const open: WorkSession = {
      ...first,
      ended_at: null,
      events: [snapshot(Step.ATTEMPT, "2026-11-19T22:05:00Z"), snapshot(Step.ATTEMPT, "2026-11-19T22:12:00Z")],
    };

    expect(sessionSegments(open)).toEqual([
      { step: Step.ATTEMPT, started_at: "2026-11-19T22:00:00Z", ended_at: "2026-11-19T22:12:00Z" },
    ]);
    expect(sessionSeconds(open)).toBe(12 * 60);
  });

  it("has no segments before the first event", () => {
    expect(sessionSegments({ ...first, ended_at: null, events: [] })).toEqual([]);
  });
});

describe("sessionSeconds", () => {
  it("counts from the session's start to its end", () => {
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
