import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Button, buttonClassName } from "./Button";

describe("Button", () => {
  it("is a plain button by default, so it never submits a form by accident", () => {
    render(<Button>Save</Button>);

    expect(screen.getByRole("button", { name: "Save" }).getAttribute("type")).toBe("button");
  });

  it("calls onClick, and not when disabled", () => {
    const onClick = vi.fn();
    const { rerender } = render(<Button onClick={onClick}>Save</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);

    rerender(
      <Button onClick={onClick} disabled>
        Save
      </Button>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("has a press state and a 44 px touch target", () => {
    const classes = buttonClassName({ variant: "filled", size: "regular" });

    expect(classes).toContain("active:");
    expect(classes).toContain("pointer-coarse:min-h-11");
    expect(buttonClassName({ size: "icon" })).toContain("pointer-coarse:size-11");
  });
});
