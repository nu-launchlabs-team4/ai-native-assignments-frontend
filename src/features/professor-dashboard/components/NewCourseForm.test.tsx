import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api";

import { NewCourseForm } from "./NewCourseForm";

describe("NewCourseForm", () => {
  it("asks for a title instead of sending an empty one", () => {
    const onCreate = vi.fn();
    render(<NewCourseForm onCreate={onCreate} />);

    fireEvent.click(screen.getByRole("button", { name: "Add course" }));

    expect(screen.getByRole("alert").textContent).toBe("Give the course a title.");
    expect(onCreate).not.toHaveBeenCalled();
  });

  it("shows the backend's message and keeps the title when adding fails", async () => {
    const onCreate = vi.fn(async () => {
      throw new ApiError("Too many requests. Please wait a moment and try again.", 429, "rate_limited", null);
    });
    render(<NewCourseForm onCreate={onCreate} />);

    fireEvent.change(screen.getByLabelText("New course"), { target: { value: "Algorithms" } });
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Add course" })));

    expect(screen.getByRole("alert").textContent).toMatch(/Too many requests/);
    expect(screen.getByLabelText<HTMLInputElement>("New course").value).toBe("Algorithms");
  });
});
