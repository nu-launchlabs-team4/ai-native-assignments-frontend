import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AnswerType } from "@/lib/constants";

import { MOCK_DRAFT } from "../mock-draft";
import { AssignmentSetup } from "./AssignmentSetup";

function questionItems() {
  return within(screen.getByRole("list", { name: "Detected questions" })).getAllByRole("listitem");
}

describe("AssignmentSetup", () => {
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
    fireEvent.change(within(written).getByLabelText("Answer type"), { target: { value: AnswerType.CODE } });

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
});
