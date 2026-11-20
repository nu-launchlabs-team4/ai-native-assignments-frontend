import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { THEME_STORAGE_KEY } from "@/lib/constants";

import { ThemeToggle } from "./ThemeToggle";

afterEach(() => {
  document.documentElement.classList.remove("dark");
  localStorage.clear();
});

describe("ThemeToggle", () => {
  it("starts in light mode", () => {
    render(<ThemeToggle />);

    expect(screen.getByRole("button", { name: "Switch to dark mode" })).toBeDefined();
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("switches to dark mode and remembers the choice", async () => {
    render(<ThemeToggle />);

    // The button re-renders from a MutationObserver callback, which runs as a microtask.
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Switch to dark mode" }));
    });

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(screen.getByRole("button", { name: "Switch to light mode" })).toBeDefined();
  });

  it("switches back to light mode", async () => {
    render(<ThemeToggle />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Switch to dark mode" }));
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Switch to light mode" }));
    });

    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
  });
});
