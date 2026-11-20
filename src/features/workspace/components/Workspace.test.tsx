import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { getMockAssignment, MOCK_ASSIGNMENT_ID } from "../mock-assignment";
import { Workspace } from "./Workspace";

// Monaco can't run in jsdom, so stand in a plain text area with the same accessible name.
vi.mock("./CodeEditor", () => ({
  CodeEditor: ({ value, ariaLabel }: { value: string; ariaLabel: string }) => (
    <textarea aria-label={ariaLabel} defaultValue={value} />
  ),
}));

const assignment = getMockAssignment(MOCK_ASSIGNMENT_ID)!;

describe("Workspace", () => {
  it("shows the assignment title", () => {
    render(<Workspace assignment={assignment} />);

    expect(screen.getByRole("heading", { level: 1, name: assignment.title })).toBeDefined();
  });

  it("has the instructions, editor and AI tutor panels", () => {
    render(<Workspace assignment={assignment} />);

    expect(screen.getByRole("region", { name: "Instructions" })).toBeDefined();
    expect(screen.getByRole("region", { name: "Your code" })).toBeDefined();
    expect(screen.getByRole("region", { name: "AI tutor" })).toBeDefined();
  });

  it("puts the starter code in the editor", () => {
    render(<Workspace assignment={assignment} />);

    const editor = screen.getByLabelText(`Code editor for ${assignment.title}`) as HTMLTextAreaElement;
    expect(editor.value).toBe(assignment.starterCode);
  });

  it("shows the step stepper", () => {
    render(<Workspace assignment={assignment} />);

    expect(screen.getByRole("navigation", { name: "Assignment steps" })).toBeDefined();
  });
});
