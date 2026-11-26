import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api";

import { InterviewPanel } from "./InterviewPanel";

const QUESTIONS = ["Why a loop?", "What changed?", "What about consonants?"];

function renderPanel(overrides: Partial<Parameters<typeof InterviewPanel>[0]> = {}) {
  const props = {
    submissionId: "sub-1",
    loadQuestions: vi.fn().mockResolvedValue(QUESTIONS),
    isSubmitting: false,
    submitError: null,
    onSubmit: vi.fn().mockResolvedValue(true),
    ...overrides,
  };
  render(<InterviewPanel {...props} />);
  return props;
}

async function answerAll() {
  for (const [index, question] of QUESTIONS.entries()) {
    fireEvent.change(await screen.findByLabelText(`${index + 1}. ${question}`), { target: { value: `Answer ${index + 1}` } });
  }
}

function submitButton() {
  return screen.getByRole("button", { name: "Submit assignment" });
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("InterviewPanel", () => {
  it("submits only with every answer and a complete declaration", async () => {
    renderPanel();
    await answerAll();
    expect(submitButton()).toHaveProperty("disabled", true);

    fireEvent.click(screen.getByRole("radio", { name: "I also used other AI tools" }));
    expect(submitButton()).toHaveProperty("disabled", true);
    fireEvent.change(screen.getByLabelText("Which tools, and what did you use them for?"), {
      target: { value: "ChatGPT to explain Big-O." },
    });

    expect(submitButton()).toHaveProperty("disabled", false);
  });

  it("asks before the final submit, and Cancel goes back", async () => {
    const { onSubmit } = renderPanel();
    await answerAll();
    fireEvent.click(screen.getByRole("radio", { name: "Only this app's AI tutor" }));

    fireEvent.click(submitButton());
    expect(screen.getByText("You can't change your work after this. Submit the assignment?")).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.click(submitButton());
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    });
    expect(onSubmit).toHaveBeenCalledWith({
      interview_answers: QUESTIONS.map((question, index) => ({ question, answer: `Answer ${index + 1}` })),
      ai_declaration: "Used only this app's AI tutor.",
    });
  });

  it("keeps the draft across a reload, and forgets it after submitting", async () => {
    renderPanel();
    fireEvent.change(await screen.findByLabelText(`1. ${QUESTIONS[0]}`), { target: { value: "Half done" } });
    expect(window.localStorage.getItem("interview-draft:sub-1")).toContain("Half done");

    const { unmount } = render(<div />);
    unmount();
    document.body.innerHTML = "";
    renderPanel();
    expect(((await screen.findByLabelText(`1. ${QUESTIONS[0]}`)) as HTMLTextAreaElement).value).toBe("Half done");

    await answerAll();
    fireEvent.click(screen.getByRole("radio", { name: "Only this app's AI tutor" }));
    fireEvent.click(submitButton());
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    });
    expect(window.localStorage.getItem("interview-draft:sub-1")).toBeNull();
  });

  it("keeps the draft when the submit fails", async () => {
    renderPanel({ onSubmit: vi.fn().mockResolvedValue(false), submitError: "Couldn't submit." });
    await answerAll();
    fireEvent.click(screen.getByRole("radio", { name: "Only this app's AI tutor" }));
    fireEvent.click(submitButton());
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    });

    expect(window.localStorage.getItem("interview-draft:sub-1")).toContain("Answer 1");
    expect(screen.getByRole("alert").textContent).toBe("Couldn't submit.");
  });

  it("says when the questions aren't ready, and tries again", async () => {
    const loadQuestions = vi
      .fn()
      .mockRejectedValueOnce(new ApiError("Not Found", 404, "not_found", null))
      .mockResolvedValueOnce(QUESTIONS);
    renderPanel({ loadQuestions });

    expect((await screen.findByRole("alert")).textContent).toContain("aren't ready yet");
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    });

    expect(await screen.findByLabelText(`1. ${QUESTIONS[0]}`)).toBeDefined();
  });
});
