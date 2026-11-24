import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SegmentedControl } from "./SegmentedControl";

const SEGMENTS = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
  { value: "c", label: "Gamma", icon: <svg aria-hidden="true" /> },
] as const;

describe("SegmentedControl", () => {
  it("is a named group of radio buttons, one per segment", () => {
    render(<SegmentedControl legend="Pick one" segments={SEGMENTS} value={null} onChange={vi.fn()} />);

    expect(screen.getByRole("group", { name: "Pick one" })).toBeDefined();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
  });

  it("names icon segments for screen readers", () => {
    render(<SegmentedControl legend="Pick one" segments={SEGMENTS} value={null} onChange={vi.fn()} />);

    expect(screen.getByRole("radio", { name: "Gamma" })).toBeDefined();
  });

  it("marks the chosen segment and reports changes", () => {
    const onChange = vi.fn();
    render(<SegmentedControl legend="Pick one" segments={SEGMENTS} value="b" onChange={onChange} />);

    expect((screen.getByRole("radio", { name: "Beta" }) as HTMLInputElement).checked).toBe(true);
    fireEvent.click(screen.getByRole("radio", { name: "Alpha" }));
    expect(onChange).toHaveBeenCalledWith("a");
  });

  it("can't be changed while disabled", () => {
    render(<SegmentedControl legend="Pick one" segments={SEGMENTS} value="a" onChange={vi.fn()} disabled />);

    // A disabled fieldset disables its inputs without setting their own disabled property.
    expect(screen.getByRole("radio", { name: "Beta" }).matches(":disabled")).toBe(true);
  });
});
