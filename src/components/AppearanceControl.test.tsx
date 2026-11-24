import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { THEME_STORAGE_KEY } from "@/lib/constants";

import { AppearanceControl } from "./AppearanceControl";

afterEach(() => {
  document.documentElement.classList.remove("dark");
  localStorage.clear();
  window.__prefersDark = false;
});

function choose(name: string) {
  return act(async () => {
    fireEvent.click(screen.getByRole("radio", { name }));
  });
}

describe("AppearanceControl", () => {
  it("follows the system by default", () => {
    render(<AppearanceControl />);

    expect(screen.getByRole("group", { name: "Appearance" })).toBeDefined();
    expect((screen.getByRole("radio", { name: "System" }) as HTMLInputElement).checked).toBe(true);
  });

  it("switches to dark and remembers it", async () => {
    render(<AppearanceControl />);

    await choose("Dark");

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect((screen.getByRole("radio", { name: "Dark" }) as HTMLInputElement).checked).toBe(true);
  });

  it("switches to light even when the device is dark", async () => {
    window.__prefersDark = true;
    render(<AppearanceControl />);

    await choose("Light");

    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
  });

  it("going back to System forgets the choice and follows the device", async () => {
    window.__prefersDark = true;
    render(<AppearanceControl />);
    await choose("Light");

    await choose("System");

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});
