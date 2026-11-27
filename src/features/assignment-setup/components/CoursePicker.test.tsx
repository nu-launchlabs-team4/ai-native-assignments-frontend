import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import * as api from "@/lib/api";
import { ApiError } from "@/lib/api";

import { CoursePicker } from "./CoursePicker";

// The sidebar menu button in the top bar reads the route.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/professor/assignments/new",
}));

// Only the fields the picker reads, so the test doesn't depend on CourseOut's other fields.
const COURSE = { id: "c 1", title: "Intro to Programming", created_at: "2026-11-20T00:00:00Z" };

describe("CoursePicker", () => {
  afterEach(() => vi.restoreAllMocks());

  it("lists the professor's courses, each starting a new assignment in it", async () => {
    const fetch = vi.spyOn(api, "apiFetch").mockResolvedValue([COURSE]);
    render(<CoursePicker />);

    expect(screen.getByRole("status").textContent).toBe("Loading your courses…");
    const list = await screen.findByRole("list", { name: "Your courses" });
    expect(fetch).toHaveBeenCalledWith("/courses");
    expect(screen.getByRole("heading", { level: 1, name: "Which course is this for?" })).toBeDefined();
    expect(within(list).getByRole("link", { name: /Intro to Programming/ }).getAttribute("href")).toBe(
      "/professor/assignments/new?course=c%201",
    );
  });

  it("sends a professor with no courses to add one first", async () => {
    vi.spyOn(api, "apiFetch").mockResolvedValue([]);
    render(<CoursePicker />);

    const link = await screen.findByRole("link", { name: "Add a course first" });
    expect(link.getAttribute("href")).toBe("/professor");
  });

  it("shows the backend's message and can try again", async () => {
    vi.spyOn(api, "apiFetch")
      .mockRejectedValueOnce(new ApiError("Too many requests. Please wait a moment and try again.", 429, "rate_limited", null))
      .mockResolvedValueOnce([COURSE]);
    render(<CoursePicker />);

    expect((await screen.findByRole("alert")).textContent).toContain("Too many requests.");
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByRole("link", { name: /Intro to Programming/ })).toBeDefined();
  });
});
