import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api";

import { apiAssignmentClient } from "../assignment-client";
import { MOCK_DRAFT } from "../mock-draft";
import { blankDraft } from "../new-draft";
import { newQuestion } from "../questions";
import type { SetupAssignment } from "../types";
import { AssignmentSetup } from "./AssignmentSetup";

// The sidebar menu button in the top bar reads the route.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/professor/assignments/new",
}));

function questionItems() {
  return within(screen.getByRole("list", { name: "Questions" })).getAllByRole("listitem");
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

  it("says when there are no questions yet", () => {
    render(<AssignmentSetup initialAssignment={{ ...MOCK_DRAFT, questions: [] }} />);

    expect(screen.getByText("No questions yet. Add one below.")).toBeDefined();
  });

  it("adds and removes questions, numbering them in order", () => {
    render(<AssignmentSetup initialAssignment={MOCK_DRAFT} />);

    fireEvent.click(screen.getByRole("button", { name: "Add question" }));
    expect(questionItems()).toHaveLength(4);
    expect(within(questionItems()[3]).getByRole("radio", { name: "Written" })).toHaveProperty("checked", true);

    fireEvent.click(screen.getByRole("button", { name: "Remove question 1" }));
    const items = questionItems();
    expect(items).toHaveLength(3);
    expect(within(items[0]).getByRole("heading", { name: "Question 1" })).toBeDefined();
    expect(items[0].textContent).toContain("Written");
  });

  it("keeps the last question, since an assignment needs one", () => {
    render(<AssignmentSetup initialAssignment={{ ...MOCK_DRAFT, questions: [MOCK_DRAFT.questions[0]] }} />);

    expect(screen.queryByRole("button", { name: /Remove question/ })).toBeNull();
  });

  it("won't save an empty title or question, and says what to fix", () => {
    const save = vi.spyOn(apiAssignmentClient, "save");
    render(<AssignmentSetup initialAssignment={{ ...MOCK_DRAFT, id: "real-1" }} />);

    fireEvent.change(screen.getByLabelText("Title"), { target: { value: " " } });
    fireEvent.click(screen.getByRole("button", { name: "Save draft" }));
    expect(screen.getByRole("alert").textContent).toBe("Give the assignment a title.");

    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Week 4" } });
    fireEvent.click(screen.getByRole("button", { name: "Add question" }));
    fireEvent.click(screen.getByRole("button", { name: "Save draft" }));
    expect(screen.getByRole("alert").textContent).toBe("Fill in the text of every question.");
    expect(save).not.toHaveBeenCalled();
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

describe("AssignmentSetup with a new draft", () => {
  afterEach(() => vi.restoreAllMocks());

  const PDF = new File(["%PDF"], "week-4.pdf", { type: "application/pdf" });
  const COURSE = "c1";

  function startNewDraft() {
    const draft = blankDraft(COURSE, PDF);
    render(<AssignmentSetup initialAssignment={draft} pdf={PDF} />);
    fireEvent.change(screen.getByLabelText("Question text"), { target: { value: "Explain a loop." } });
    return draft;
  }

  function saved(id: string, extra: Partial<SetupAssignment> = {}): SetupAssignment {
    return { ...blankDraft(COURSE, PDF), id, questions: [{ ...newQuestion(1), id: "q-real", prompt: "Explain a loop." }], ...extra };
  }

  it("creates the assignment on the first save, attaches the PDF and points the address at it", async () => {
    const create = vi.spyOn(apiAssignmentClient, "create").mockResolvedValue(saved("a-new"));
    const attach = vi
      .spyOn(apiAssignmentClient, "attachPdf")
      .mockResolvedValue(saved("a-new", { source_pdf: "assignments/a-new/x.pdf" }));
    const replace = vi.spyOn(window.history, "replaceState");
    const save = vi.spyOn(apiAssignmentClient, "save").mockResolvedValue(saved("a-new"));
    startNewDraft();
    expect(screen.getByText(/We can't read questions from a PDF yet/)).toBeDefined();

    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Save draft" })));

    expect(create).toHaveBeenCalledWith(expect.objectContaining({ course_id: COURSE, title: "week 4" }));
    expect(attach).toHaveBeenCalledWith("a-new", PDF);
    expect(replace).toHaveBeenCalledWith(null, "", "/professor/assignments/a-new");
    expect(screen.getByText("Draft saved.")).toBeDefined();
    expect(screen.getByText("PDF attached")).toBeDefined();

    // Saving again edits the same draft and doesn't upload the PDF twice.
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Save draft" })));
    expect(create).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledTimes(1);
    expect(attach).toHaveBeenCalledTimes(1);
  });

  it("keeps the saved draft when the PDF fails, and tries the PDF again on the next save", async () => {
    const create = vi.spyOn(apiAssignmentClient, "create").mockResolvedValue(saved("a-new"));
    const attach = vi
      .spyOn(apiAssignmentClient, "attachPdf")
      .mockRejectedValueOnce(new ApiError("Could not store the PDF. Try again later.", 502, "bad_gateway", null))
      .mockResolvedValueOnce(saved("a-new", { source_pdf: "assignments/a-new/x.pdf" }));
    vi.spyOn(apiAssignmentClient, "save").mockResolvedValue(saved("a-new"));
    startNewDraft();

    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Save draft" })));
    expect(screen.getByRole("alert").textContent).toBe(
      "Draft saved, but the PDF didn't upload. Could not store the PDF. Try again later. Save again to retry.",
    );

    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Save draft" })));
    expect(create).toHaveBeenCalledTimes(1);
    expect(attach).toHaveBeenCalledTimes(2);
    expect(screen.getByText("Draft saved.")).toBeDefined();
  });

  it("creates, then publishes, when the professor publishes before saving", async () => {
    vi.spyOn(apiAssignmentClient, "create").mockResolvedValue(saved("a-new"));
    vi.spyOn(apiAssignmentClient, "attachPdf").mockResolvedValue(saved("a-new"));
    const publish = vi
      .spyOn(apiAssignmentClient, "publish")
      .mockResolvedValue(saved("a-new", { published_at: "2026-11-27T00:00:00Z" }));
    startNewDraft();

    fireEvent.click(screen.getByRole("button", { name: "Publish" }));
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Yes, publish" })));

    expect(publish).toHaveBeenCalledWith("a-new");
    expect(screen.getByText("Published assignment")).toBeDefined();
    expect(screen.queryByRole("button", { name: "Add question" })).toBeNull();
  });
});
