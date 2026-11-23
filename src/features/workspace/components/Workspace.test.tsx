import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Step } from "@/lib/constants";

import type { SubmissionClient } from "../submission-client";
import { buildSubmission } from "../testing";
import { Workspace } from "./Workspace";

// Monaco and MathLive can't run in jsdom, so stand in plain fields with the same accessible names.
// vi.hoisted makes the fake available to vi.mock, which runs before the rest of the file.
const { FakeEditor } = vi.hoisted(() => ({
  FakeEditor: ({
    value,
    ariaLabel,
    onChange,
    readOnly,
  }: {
    value: string;
    ariaLabel: string;
    onChange?: (value: string) => void;
    readOnly?: boolean;
  }) => (
    <textarea
      aria-label={ariaLabel}
      value={value}
      readOnly={readOnly}
      onChange={(event) => onChange?.(event.target.value)}
    />
  ),
}));
vi.mock("./CodeEditor", () => ({ CodeEditor: FakeEditor }));
vi.mock("./MathAnswer", () => ({ MathAnswer: FakeEditor }));

// The AI tutor panel uses the router, which only exists inside the Next.js app.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/student/assignments/sample-1",
}));

const submission = buildSubmission();

function fakeClient(): SubmissionClient {
  return {
    start: vi.fn(),
    saveAttemptAnswers: vi.fn().mockResolvedValue(submission),
    finishAttempt: vi.fn().mockResolvedValue(buildSubmission({ current_step: Step.FEEDBACK })),
  };
}

function renderWorkspace(client = fakeClient()) {
  render(<Workspace client={client} initialSubmission={submission} />);
  return client;
}

function openQuestion(number: number) {
  const list = screen.getByRole("navigation", { name: "Questions" });
  fireEvent.click(within(list).getByRole("button", { name: new RegExp(`^Question ${number}`) }));
}

function answer(number: number, value: string) {
  openQuestion(number);
  fireEvent.change(screen.getByLabelText(`Your answer to question ${number}`), { target: { value } });
}

describe("Workspace", () => {
  it("shows the title, the steps and the three panes", () => {
    renderWorkspace();

    expect(screen.getByRole("heading", { level: 1, name: submission.assignment.title })).toBeDefined();
    expect(screen.getByRole("navigation", { name: "Assignment steps" })).toBeDefined();
    expect(screen.getByRole("region", { name: "Assignment" })).toBeDefined();
    expect(screen.getByRole("region", { name: "Question 1" })).toBeDefined();
    expect(screen.getByRole("region", { name: "AI tutor" })).toBeDefined();
  });

  it("opens the code question first, with its starter code and file name", () => {
    renderWorkspace();

    const editor = screen.getByLabelText("Your answer to question 1") as HTMLTextAreaElement;
    expect(editor.value).toContain("def count_vowels");
    expect(screen.getByText("solution.py")).toBeDefined();
    expect(screen.getByText("Question 1 of 3")).toBeDefined();
  });

  it("keeps each answer when switching between questions", () => {
    renderWorkspace();
    answer(2, "My explanation");

    openQuestion(1);
    openQuestion(2);

    expect((screen.getByLabelText("Your answer to question 2") as HTMLTextAreaElement).value).toBe("My explanation");
  });

  it("ticks questions off as they are answered, ignoring untouched starter code", () => {
    renderWorkspace();
    expect(screen.getByText("0 of 3 answered")).toBeDefined();

    answer(2, "It loops over each letter");

    expect(screen.getByText("1 of 3 answered")).toBeDefined();
    const list = screen.getByRole("navigation", { name: "Questions" });
    expect(within(list).getByRole("button", { name: /^Question 2/ }).textContent).toContain("answered");
  });

  it("keeps the AI tutor locked during the attempt", () => {
    renderWorkspace();

    expect(screen.getByText("AI tutor is locked")).toBeDefined();
  });

  it("submits the attempt, then makes answers read-only and unlocks the tutor", async () => {
    const client = renderWorkspace();
    answer(1, "def count_vowels(text):\n    return 0");
    answer(2, "It loops over each letter.");
    answer(3, "5n+5");
    fireEvent.click(screen.getByRole("radio", { name: "4" }));
    fireEvent.change(screen.getByLabelText("How did you approach it?"), { target: { value: "Count in a loop." } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Submit attempt" }));
    });

    expect(client.saveAttemptAnswers).toHaveBeenCalled();
    expect(client.finishAttempt).toHaveBeenCalledWith("sub-1", { confidence: 4, approach_note: "Count in a loop." });
    expect(screen.getByText("Attempt submitted")).toBeDefined();
    expect((screen.getByLabelText("Your answer to question 3") as HTMLTextAreaElement).readOnly).toBe(true);
    expect(screen.queryByText("AI tutor is locked")).toBeNull();
    expect(screen.getByLabelText("Message the AI tutor")).toBeDefined();
  });
});
