import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api";

import { apiAssignmentClient } from "../assignment-client";
import { MOCK_DRAFT } from "../mock-draft";
import { AssignmentSetup } from "./AssignmentSetup";

// The sidebar menu button in the top bar reads the route.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/professor/assignments/new",
}));

function questionItems() {
  return within(screen.getByRole("list", { name: "Detected questions" })).getAllByRole("listitem");
}

describe("AssignmentSetup", () => {
  afterEach(() => vi.restoreAllMocks());

  it("shows the detected questions in order with their answer types", () => {
    render(<AssignmentSetup initialAssignment={MOCK_DRAFT} />);

    expect(screen.getByRole("heading", { level: 1, name: MOCK_DRAFT.title })).toBeDefined();
    const items = questionItems();
    expect(items).toHaveLength(3);
    ["Code", "Written", "Math"].forEach((label, index) => {
      expect(within(items[index]).getByRole("heading", { name: `Question ${index + 1}` })).toBeDefined();
      expect(items[index].textContent).toContain(label);
    });
  });

  it("updates a question when the professor changes its answer type", () => {
    render(<AssignmentSetup initialAssignment={MOCK_DRAFT} />);

    const written = questionItems()[1];
    fireEvent.click(within(written).getByRole("radio", { name: "Code" }));

    expect(within(questionItems()[1]).getByLabelText<HTMLSelectElement>("Language").value).toBe("python");
  });

  it("updates a setting when the professor picks a new one", () => {
    render(<AssignmentSetup initialAssignment={MOCK_DRAFT} />);

    fireEvent.click(screen.getByRole("radio", { name: "Concept explanations" }));

    expect(screen.getByRole<HTMLInputElement>("radio", { name: "Concept explanations" }).checked).toBe(true);
  });

  it("explains when the PDF had no questions", () => {
    render(<AssignmentSetup initialAssignment={{ ...MOCK_DRAFT, questions: [] }} />);

    expect(screen.getByText("No questions were found in this PDF.")).toBeDefined();
  });

  it("saves the draft and says so", async () => {
    render(<AssignmentSetup initialAssignment={MOCK_DRAFT} />);

    fireEvent.click(screen.getByRole("button", { name: "Save draft" }));

    expect(screen.getByRole("button", { name: "Saving…" })).toHaveProperty("disabled", true);
    expect(await screen.findByText("Draft saved.")).toBeDefined();
  });

  it("asks before publishing, then locks the assignment", async () => {
    render(<AssignmentSetup initialAssignment={MOCK_DRAFT} />);

    fireEvent.click(screen.getByRole("button", { name: "Publish" }));
    fireEvent.click(screen.getByRole("button", { name: "Yes, publish" }));

    expect(await screen.findByText("Published. Students in this course can now see it.")).toBeDefined();
    expect(screen.getByText("Published assignment")).toBeDefined();
    expect(screen.queryByRole("button", { name: "Save draft" })).toBeNull();
    expect(within(questionItems()[0]).getByRole("radio", { name: "Code" }).matches(":disabled")).toBe(true);
  });

  it("can cancel publishing", () => {
    render(<AssignmentSetup initialAssignment={MOCK_DRAFT} />);

    fireEvent.click(screen.getByRole("button", { name: "Publish" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.getByRole("button", { name: "Save draft" })).toBeDefined();
  });

  it("shows the backend's message when saving fails and keeps the edits", async () => {
    const conflict = new ApiError("This assignment is already published.", 409, "conflict", null);
    vi.spyOn(apiAssignmentClient, "save").mockRejectedValue(conflict);
    render(<AssignmentSetup initialAssignment={{ ...MOCK_DRAFT, id: "real-1" }} />);
    fireEvent.click(screen.getByRole("radio", { name: "Concept explanations" }));

    fireEvent.click(screen.getByRole("button", { name: "Save draft" }));

    expect((await screen.findByRole("alert")).textContent).toBe("This assignment is already published.");
    expect(screen.getByRole<HTMLInputElement>("radio", { name: "Concept explanations" }).checked).toBe(true);
  });

  it("needs a question before it can publish", () => {
    render(<AssignmentSetup initialAssignment={{ ...MOCK_DRAFT, questions: [] }} />);

    expect(screen.getByRole("button", { name: "Publish" })).toHaveProperty("disabled", true);
    expect(screen.getByText("Add at least one question to publish.")).toBeDefined();
  });
});
