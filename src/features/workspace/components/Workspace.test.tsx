
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { getMockAssignment, MOCK_ASSIGNMENT_ID } from "../mock-assignment";
import { Workspace } from "./Workspace";

// Monaco and MathLive can't run in jsdom, so stand in plain fields with the same accessible names.
vi.mock("./CodeEditor", () => ({
  CodeEditor: ({
    value,
    ariaLabel,
    onChange,
  }: {
    value: string;
    ariaLabel: string;
    onChange?: (v: string) => void;
  }) => (
    <textarea
      aria-label={ariaLabel}
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
    />
  ),
}));

vi.mock("./MathAnswer", () => ({
  MathAnswer: ({ ariaLabel }: { ariaLabel: string }) => (
    <div role="group" aria-label={`${ariaLabel} (math)`} />
  ),
}));

// The AI tutor panel uses the router, which only exists inside the Next.js app.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const assignment = getMockAssignment(MOCK_ASSIGNMENT_ID)!;

function openQuestion(number: number) {
  const list = screen.getByRole("navigation", { name: "Questions" });

  fireEvent.click(
    within(list).getByRole("button", {
      name: new RegExp(`^Question ${number}`),
    }),
  );
}

describe("Workspace", () => {
  it("shows the title, the steps and the three panes", () => {
    render(<Workspace assignment={assignment} />);

    expect(
      screen.getByRole("heading", { level: 1, name: assignment.title }),
    ).toBeDefined();
    expect(
      screen.getByRole("navigation", { name: "Assignment steps" }),
    ).toBeDefined();
    expect(screen.getByRole("region", { name: "Assignment" })).toBeDefined();
    expect(screen.getByRole("region", { name: "Question 1" })).toBeDefined();
    expect(screen.getByRole("region", { name: "AI tutor" })).toBeDefined();
  });

  it("lists every question with its answer type", () => {
    render(<Workspace assignment={assignment} />);

    const items = within(
      screen.getByRole("navigation", { name: "Questions" }),
    ).getAllByRole("button");

    expect(items.map((item) => item.textContent)).toEqual([
      "Question 1Code",
      "Question 2Written",
      "Question 3Math",
    ]);
  });

  it("opens the code question first, with its starter code and file name", () => {
    render(<Workspace assignment={assignment} />);

    const editor = screen.getByLabelText(
      "Your answer to question 1",
    ) as HTMLTextAreaElement;

    expect(editor.value).toBe(assignment.questions[0].starterAnswer);
    expect(screen.getByText("solution.py")).toBeDefined();
    expect(screen.getByText("Question 1 of 3")).toBeDefined();
  });

  it("shows a text box for the written question and counts words", () => {
    render(<Workspace assignment={assignment} />);
    openQuestion(2);

    const answer = screen.getByLabelText("Your answer to question 2");

    fireEvent.change(answer, {
      target: { value: "It loops over each letter" },
    });

    expect(screen.getByText("5 words")).toBeDefined();
  });

  it("shows the math editor for the math question", () => {
    render(<Workspace assignment={assignment} />);
    openQuestion(3);

    expect(
      screen.getByRole("group", {
        name: "Your answer to question 3 (math)",
      }),
    ).toBeDefined();
  });

  it("keeps each answer when switching between questions", () => {
    render(<Workspace assignment={assignment} />);
    openQuestion(2);

    fireEvent.change(screen.getByLabelText("Your answer to question 2"), {
      target: { value: "My explanation" },
    });

    openQuestion(1);
    openQuestion(2);

    expect(
      (screen.getByLabelText(
        "Your answer to question 2",
      ) as HTMLTextAreaElement).value,
    ).toBe("My explanation");
  });

  it("detects paste events in the answer editor", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    try {
      render(<Workspace assignment={assignment} />);

      const editor = screen.getByLabelText("Your answer to question 1");

      fireEvent.paste(editor);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Activity detected:",
        expect.objectContaining({
          type: "paste",
          questionId: "q1",
          timestamp: expect.any(String),
        }),
      );
    } finally {
      consoleSpy.mockRestore();
    }
  });

  it("records when the student switches away from the assignment tab", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    try {
      render(<Workspace assignment={assignment} />);

      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        value: "hidden",
      });

      fireEvent(document, new Event("visibilitychange"));

      expect(consoleSpy).toHaveBeenCalledWith(
        "Activity detected:",
        expect.objectContaining({
          type: "tab_hidden",
          questionId: "q1",
          timestamp: expect.any(String),
        }),
      );
    } finally {
      consoleSpy.mockRestore();
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        value: "visible",
      });
    }
  });

  it("records when the student returns to the assignment tab", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    try {
      render(<Workspace assignment={assignment} />);

      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        value: "visible",
      });

      fireEvent(document, new Event("visibilitychange"));

      expect(consoleSpy).toHaveBeenCalledWith(
        "Activity detected:",
        expect.objectContaining({
          type: "tab_visible",
          questionId: "q1",
          timestamp: expect.any(String),
        }),
      );
    } finally {
      consoleSpy.mockRestore();
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        value: "visible",
      });
    }
  });

  it("allows the student to dismiss the activity notice", () => {
    render(<Workspace assignment={assignment} />);

    // The notice should be visible initially.
    expect(screen.getByRole("note")).toBeDefined();

    // Dismiss the notice.
    fireEvent.click(
      screen.getByRole("button", {
        name: "Dismiss activity monitoring notice",
      }),
    );

    // The notice should no longer be visible.
    expect(screen.queryByRole("note")).toBeNull();
  });
});
