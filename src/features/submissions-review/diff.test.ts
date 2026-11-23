import { describe, expect, it } from "vitest";

import { DiffLineType, diffLines } from "./diff";

const { SAME, ADDED, REMOVED } = DiffLineType;

describe("diffLines", () => {
  it("marks every line as unchanged when nothing changed", () => {
    expect(diffLines("a\nb", "a\nb")).toEqual([
      { type: SAME, text: "a" },
      { type: SAME, text: "b" },
    ]);
  });

  it("finds an added line in the middle", () => {
    expect(diffLines("a\nc", "a\nb\nc")).toEqual([
      { type: SAME, text: "a" },
      { type: ADDED, text: "b" },
      { type: SAME, text: "c" },
    ]);
  });

  it("shows a changed line as removed then added", () => {
    expect(diffLines("x = 1\nreturn x", "x = 2\nreturn x")).toEqual([
      { type: REMOVED, text: "x = 1" },
      { type: ADDED, text: "x = 2" },
      { type: SAME, text: "return x" },
    ]);
  });

  it("handles lines removed at the end", () => {
    expect(diffLines("a\nb\nc", "a")).toEqual([
      { type: SAME, text: "a" },
      { type: REMOVED, text: "b" },
      { type: REMOVED, text: "c" },
    ]);
  });
});
