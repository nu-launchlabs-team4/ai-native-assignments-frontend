import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MOCK_DRAFT } from "../mock-draft";
import { NewAssignment } from "./NewAssignment";

vi.mock("../upload-pdf", () => ({
  uploadPdf: vi.fn(async (courseId: string, file: File) => ({ ...MOCK_DRAFT, course_id: courseId, source_pdf: file.name })),
}));

describe("NewAssignment", () => {
  it("starts with the upload, then shows the questions found in the PDF", async () => {
    render(<NewAssignment courseId="course-9" />);
    expect(screen.getByRole("heading", { level: 1, name: "Upload your assignment PDF" })).toBeDefined();

    fireEvent.change(screen.getByLabelText("Choose a PDF or drag it here"), {
      target: { files: [new File(["%PDF"], "week-3.pdf", { type: "application/pdf" })] },
    });
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Turn into questions" })));

    expect(screen.getByRole("heading", { level: 1, name: MOCK_DRAFT.title })).toBeDefined();
    expect(screen.getByText("From week-3.pdf")).toBeDefined();
    expect(screen.getByRole("list", { name: "Detected questions" })).toBeDefined();
  });
});
