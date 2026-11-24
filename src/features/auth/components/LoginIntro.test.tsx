import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LoginIntro } from "./LoginIntro";

describe("LoginIntro", () => {
  it("says logging in opens the assignment people came from", () => {
    window.history.replaceState(null, "", "/login?next=%2Fstudent%2Fassignments%2Fa1");

    render(<LoginIntro />);

    expect(screen.getByText("Log in to open your assignment.")).toBeTruthy();
  });

  it("falls back to a general line", () => {
    window.history.replaceState(null, "", "/login");

    render(<LoginIntro />);

    expect(screen.getByText("Log in to continue where you left off.")).toBeTruthy();
  });
});
