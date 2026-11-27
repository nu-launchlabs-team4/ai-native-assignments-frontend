import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AnswerType } from "@/lib/constants";

import type { SetupQuestion } from "../types";
import { QuestionEditor } from "./QuestionEditor";

const CODE_QUESTION: SetupQuestion = {
  id: "q1",
  position: 1,
  prompt: "Write count_vowels(text).",
  answer_type: AnswerType.CODE,
  language: "python",
  starter_code: null,
};

function renderEditor(question: SetupQuestion = CODE_QUESTION) {
  const onChange = vi.fn();
  render(<QuestionEditor question={question} questionNumber={1} onChange={onChange} />);
  return onChange;
}

describe("QuestionEditor", () => {
  it("shows the question text, answer type and language", () => {
    renderEditor();

    expect(screen.getByRole("heading", { name: "Question 1" })).toBeDefined();
    expect(screen.getByLabelText<HTMLTextAreaElement>("Question text").value).toBe(CODE_QUESTION.prompt);
    expect(screen.getByRole("group", { name: "Answer type" })).toBeDefined();
    expect(screen.getByRole<HTMLInputElement>("radio", { name: "Code" }).checked).toBe(true);
    expect(screen.getByLabelText<HTMLSelectElement>("Language").value).toBe("python");
  });

  it("sends the edited question text", () => {
    const onChange = renderEditor();

    fireEvent.change(screen.getByLabelText("Question text"), { target: { value: "New text" } });

    expect(onChange).toHaveBeenCalledWith({ ...CODE_QUESTION, prompt: "New text" });
  });

  it("clears the language when the answer type changes from code", () => {
    const onChange = renderEditor();

    fireEvent.click(screen.getByRole("radio", { name: "Written" }));

    expect(onChange).toHaveBeenCalledWith({ ...CODE_QUESTION, answer_type: AnswerType.TEXT, language: null });
  });

  it("sends the chosen language", () => {
    const onChange = renderEditor();

    fireEvent.change(screen.getByLabelText("Language"), { target: { value: "java" } });

    expect(onChange).toHaveBeenCalledWith({ ...CODE_QUESTION, language: "java" });
  });

  it("hides the language for questions that are not code", () => {
    renderEditor({ ...CODE_QUESTION, answer_type: AnswerType.MATH, language: null });

    expect(screen.queryByLabelText("Language")).toBeNull();
  });

  it("keeps a detected language that is not in the list", () => {
    renderEditor({ ...CODE_QUESTION, language: "rust" });

    expect(screen.getByLabelText<HTMLSelectElement>("Language").value).toBe("rust");
  });

  it("flags empty question text", () => {
    renderEditor({ ...CODE_QUESTION, prompt: "" });

    const textArea = screen.getByLabelText("Question text");
    expect(textArea.getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByText("Question text is required.")).toBeDefined();
  });
});
