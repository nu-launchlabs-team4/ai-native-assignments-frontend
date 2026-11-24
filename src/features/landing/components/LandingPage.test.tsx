import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ROUTES } from "@/lib/constants";

import { LandingPage } from "./LandingPage";

describe("LandingPage", () => {
  it("shows the two-line heading", () => {
    render(<LandingPage />);

    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Show your work.Sharpen your thinking.");
  });

  it("lists the five steps in order", () => {
    render(<LandingPage />);

    const steps = within(screen.getByRole("region", { name: "The five steps of an assignment" })).getAllByRole("listitem");
    expect(steps.map((step) => step.textContent)).toEqual([
      "1Attempt",
      "2Get feedback",
      "3Evaluate",
      "4Revise",
      "5Explain",
    ]);
  });

  it("links each role card to its page as a single link", () => {
    render(<LandingPage />);

    const roles = within(screen.getByRole("navigation", { name: "Choose your role" })).getAllByRole("link");
    expect(roles).toHaveLength(2);
    expect(screen.getByRole("link", { name: /continue as student/i }).getAttribute("href")).toBe(ROUTES.STUDENT);
    expect(screen.getByRole("link", { name: /continue as professor/i }).getAttribute("href")).toBe(ROUTES.PROFESSOR);
  });

  it("keeps the Log in, appearance and System status controls", () => {
    render(<LandingPage />);

    expect(screen.getByRole("link", { name: "Log in" }).getAttribute("href")).toBe(ROUTES.LOGIN);
    expect(screen.getByRole("link", { name: "System status" }).getAttribute("href")).toBe(ROUTES.STATUS);
    screen.getByRole("group", { name: "Appearance" });
  });
});
