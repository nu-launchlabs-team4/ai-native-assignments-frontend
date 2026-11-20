import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MathAnswer } from "./MathAnswer";

// MathLive can't run in jsdom, so each line becomes a plain input with the same label.
vi.mock("./MathField", () => ({
  MathField: ({
    initialValue,
    ariaLabel,
    onChange,
  }: {
    initialValue: string;
    ariaLabel: string;
    onChange: (latex: string) => void;
  }) => <input aria-label={ariaLabel} defaultValue={initialValue} onChange={(event) => onChange(event.target.value)} />,
}));

describe("MathAnswer", () => {
  it("starts with one empty step", () => {
    render(<MathAnswer value="" ariaLabel="Answer" onChange={() => {}} />);

    expect(screen.getAllByRole("textbox")).toHaveLength(1);
    expect(screen.queryByRole("button", { name: /Remove step/ })).toBeNull();
  });

  it("shows one editor per saved line", () => {
    render(<MathAnswer value={"3n+2n+5\n5n+5"} ariaLabel="Answer" onChange={() => {}} />);

    expect((screen.getByLabelText("Answer, step 1") as HTMLInputElement).value).toBe("3n+2n+5");
    expect((screen.getByLabelText("Answer, step 2") as HTMLInputElement).value).toBe("5n+5");
  });

  it("joins the steps with new lines when one changes", () => {
    const onChange = vi.fn();
    render(<MathAnswer value={"3n+2n+5\n"} ariaLabel="Answer" onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("Answer, step 2"), { target: { value: "5n+5" } });

    expect(onChange).toHaveBeenLastCalledWith("3n+2n+5\n5n+5");
  });

  it("adds and removes steps", () => {
    const onChange = vi.fn();
    render(<MathAnswer value="5n+5" ariaLabel="Answer" onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "+ Add step" }));
    expect(screen.getAllByRole("textbox")).toHaveLength(2);
    expect(onChange).toHaveBeenLastCalledWith("5n+5\n");

    fireEvent.click(screen.getByRole("button", { name: "Remove step 2" }));
    expect(screen.getAllByRole("textbox")).toHaveLength(1);
    expect(onChange).toHaveBeenLastCalledWith("5n+5");
  });
});
