import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Step, SubmissionStatus } from "@/lib/constants";

import type { ActivityClient } from "../activity-client";
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
// The demo assignment's question ids.
const [Q1, Q2, Q3] = ["q1", "q2", "q3"];
const QUESTIONS = ["Why a loop?", "What changed in your revision?", "What would T(n) be for consonants?"];

function fakeClient(): SubmissionClient {
  return {
    start: vi.fn(),
    saveAttemptAnswers: vi.fn().mockResolvedValue(submission),
    finishAttempt: vi.fn().mockResolvedValue(buildSubmission({ current_step: Step.FEEDBACK })),
    saveEvaluation: vi.fn(),
    saveRevisionAnswers: vi.fn(),
    finishRevision: vi.fn(),
    getInterviewQuestions: vi.fn().mockResolvedValue(QUESTIONS),
    saveExplanation: vi.fn(),
  };
}

function fakeActivityClient(): ActivityClient {
  return {
    startSession: vi.fn().mockResolvedValue({ id: "w-1", submission_id: "sub-1", started_at: "", ended_at: null }),
    sendEvents: vi.fn().mockResolvedValue(undefined),
    endSession: vi.fn().mockResolvedValue(undefined),
  };
}

function renderWorkspace(client = fakeClient(), activityClient = fakeActivityClient()) {
  render(<Workspace client={client} activityClient={activityClient} initialSubmission={submission} />);
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

  it("submits the attempt, then makes answers read-only, unlocks the tutor and asks for an evaluation", async () => {
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
    expect(screen.getByRole("heading", { name: "Evaluate the feedback" })).toBeDefined();
    expect((screen.getByLabelText("Your answer to question 3") as HTMLTextAreaElement).readOnly).toBe(true);
    expect(screen.queryByText("AI tutor is locked")).toBeNull();
    expect(screen.getByLabelText("Message the AI tutor")).toBeDefined();
  });
  it("evaluates the feedback, revises with the attempt kept, then hands in the revision", async () => {
    const attempt = { [Q1]: "def count_vowels(text):\n    return 0", [Q2]: "Loop.", [Q3]: "5n+5" };
    const feedback = buildSubmission({ current_step: Step.FEEDBACK, attempt_answers: attempt });
    const revising = { ...feedback, current_step: Step.REVISE, revision_answers: { ...attempt } };
    const client = fakeClient();
    vi.mocked(client.saveEvaluation).mockResolvedValue(revising);
    vi.mocked(client.saveRevisionAnswers).mockResolvedValue(revising);
    vi.mocked(client.finishRevision).mockResolvedValue({ ...revising, current_step: Step.EXPLAIN });
    render(<Workspace client={client} activityClient={fakeActivityClient()} initialSubmission={feedback} />);

    fireEvent.click(screen.getByRole("radio", { name: "Partly" }));
    fireEvent.change(screen.getByLabelText("Why? Give a test case or example that shows it"), {
      target: { value: "AEIOU should give 5." },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Submit evaluation" }));
    });
    expect(client.saveEvaluation).toHaveBeenCalledWith("sub-1", { verdict: "partly_correct", test_case: "AEIOU should give 5." });

    // The revision starts as the attempt and can be edited; the original stays as it was.
    answer(2, "Loop over each letter and count vowels.");
    fireEvent.click(screen.getByRole("radio", { name: "Original attempt" }));
    const original = screen.getByLabelText("Your answer to question 2") as HTMLTextAreaElement;
    expect(original.value).toBe("Loop.");
    expect(original.readOnly).toBe(true);
    fireEvent.click(screen.getByRole("radio", { name: "Revision" }));
    expect((screen.getByLabelText("Your answer to question 2") as HTMLTextAreaElement).value).toBe(
      "Loop over each letter and count vowels.",
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Submit revision" }));
    });
    expect(client.saveRevisionAnswers).toHaveBeenCalledWith(
      "sub-1",
      { [Q2]: "Loop over each letter and count vowels." },
      undefined,
    );
    expect(client.finishRevision).toHaveBeenCalledWith("sub-1");
    expect(screen.getByRole("heading", { name: "Explain your work" })).toBeDefined();
    expect((screen.getByLabelText("Your answer to question 2") as HTMLTextAreaElement).readOnly).toBe(true);
  });
  it("closes the tutor for step 5, then submits the follow-up answers and shows the summary", async () => {
    window.localStorage.clear();
    const answers = { [Q1]: "def f(): pass", [Q2]: "Loop.", [Q3]: "5n+5" };
    const explaining = buildSubmission({ current_step: Step.EXPLAIN, attempt_answers: answers, revision_answers: answers });
    const client = fakeClient();
    vi.mocked(client.saveExplanation).mockImplementation(async (_id, body) => ({
      ...explaining,
      ...body,
      status: SubmissionStatus.SUBMITTED,
      submitted_at: "2026-11-25T12:00:00Z",
    }));
    render(<Workspace client={client} activityClient={fakeActivityClient()} initialSubmission={explaining} />);

    expect(screen.queryByLabelText("Message the AI tutor")).toBeNull();
    for (const [index, question] of QUESTIONS.entries()) {
      fireEvent.change(await screen.findByLabelText(`${index + 1}. ${question}`), { target: { value: `Answer ${index + 1}` } });
    }
    fireEvent.click(screen.getByRole("radio", { name: "Only this app's AI tutor" }));
    fireEvent.click(screen.getByRole("button", { name: "Submit assignment" }));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    });

    expect(client.saveExplanation).toHaveBeenCalledWith("sub-1", {
      interview_answers: QUESTIONS.map((question, index) => ({ question, answer: `Answer ${index + 1}` })),
      ai_declaration: "Used only this app's AI tutor.",
    });
    expect(screen.getByRole("heading", { name: "Your follow-up answers" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Submitted" })).toBeDefined();
    const steps = screen.getByRole("navigation", { name: "Assignment steps" });
    expect(within(steps).queryByText("(current step)")).toBeNull();
    expect(within(steps).getAllByText("(completed)")).toHaveLength(5);
    // Nothing is tracked after submitting, so the notice goes too.
    expect(screen.queryByRole("complementary", { name: /What your professor sees/ })).toBeNull();
  });

  it("says what the professor sees, until the student dismisses it", () => {
    renderWorkspace();

    const notice = screen.getByRole("complementary", { name: /What your professor sees/ });
    expect(notice.textContent).toContain("never the text");

    fireEvent.click(within(notice).getByRole("button", { name: "Got it" }));
    expect(screen.queryByRole("complementary", { name: /What your professor sees/ })).toBeNull();
  });

  it("starts a work session for the submission and records the size of a paste", async () => {
    vi.useFakeTimers();
    try {
      const activityClient = fakeActivityClient();
      renderWorkspace(fakeClient(), activityClient);
      await act(async () => {});
      expect(activityClient.startSession).toHaveBeenCalledWith(submission.id);

      fireEvent.paste(screen.getByLabelText("Your answer to question 1"), {
        clipboardData: { getData: () => "print('hi')" },
      });
      await act(async () => {
        vi.advanceTimersByTime(10_000);
      });

      expect(activityClient.sendEvents).toHaveBeenCalledWith(
        "w-1",
        [expect.objectContaining({ type: "paste", question_id: Q1, detail: { characters: 11 } })],
        { keepalive: false },
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it("welcomes the student back when they reopen work in progress", () => {
    const resumed = buildSubmission({ current_step: Step.EVALUATE, attempt_answers: { [Q1]: "def f(): pass" } });
    render(<Workspace client={fakeClient()} activityClient={fakeActivityClient()} initialSubmission={resumed} />);

    expect(screen.getByRole("complementary", { name: /Welcome back/ }).textContent).toContain("step 3 of 5: Evaluate");
    expect(screen.getByRole("button", { name: "Save and pause" })).toBeDefined();
  });

  it("starts a fresh submission without the welcome", () => {
    renderWorkspace();

    expect(screen.queryByRole("complementary", { name: /Welcome back/ })).toBeNull();
  });
});
