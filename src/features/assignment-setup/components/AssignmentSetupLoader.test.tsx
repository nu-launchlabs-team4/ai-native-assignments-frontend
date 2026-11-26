import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import * as api from "@/lib/api";

import { MOCK_DRAFT } from "../mock-draft";
import { AssignmentSetupLoader } from "./AssignmentSetupLoader";

// The sidebar menu button in the setup top bar reads the route.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/professor/assignments/a1",
}));

describe("AssignmentSetupLoader", () => {
  afterEach(() => vi.restoreAllMocks());

  it("loads the assignment and opens its setup page", async () => {
    const fetchSpy = vi.spyOn(api, "apiFetch").mockResolvedValue({ ...MOCK_DRAFT, id: "a1", title: "Week 4" });
    render(<AssignmentSetupLoader assignmentId="a1" />);

    expect(await screen.findByRole("heading", { level: 1, name: "Week 4" })).toBeDefined();
    expect(fetchSpy).toHaveBeenCalledWith("/assignments/a1");
  });

  it("says when the assignment isn't the professor's", async () => {
    vi.spyOn(api, "apiFetch").mockRejectedValue(new api.ApiError("Assignment not found", 404, "not_found", null));
    render(<AssignmentSetupLoader assignmentId="a1" />);

    expect(await screen.findByRole("heading", { level: 1, name: "Assignment not found" })).toBeDefined();
  });

  it("opens the sample draft without the backend", async () => {
    const fetchSpy = vi.spyOn(api, "apiFetch");
    render(<AssignmentSetupLoader assignmentId={MOCK_DRAFT.id} />);

    expect(await screen.findByRole("heading", { level: 1, name: MOCK_DRAFT.title })).toBeDefined();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
