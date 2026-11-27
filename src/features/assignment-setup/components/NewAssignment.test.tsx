import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MOCK_COURSE_ID, MOCK_DRAFT } from "../mock-draft";
import { uploadPdf } from "../upload-pdf";
import { NewAssignment } from "./NewAssignment";

// The sidebar menu button in the top bar reads the route.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/professor/assignments/new",
}));

vi.mock("../upload-pdf", () => ({
  uploadPdf: vi.fn(async (courseId: string, file: File) => ({ ...MOCK_DRAFT, course_id: courseId, source_pdf: file.name })),
}));

describe("NewAssignment", () => {
  function choosePdf() {
    fireEvent.change(screen.getByLabelText("Choose a PDF or drag it here"), {
      target: { files: [new File(["%PDF"], "week-3.pdf", { type: "application/pdf" })] },
    });
  }

  it("runs the demo parse for the sample course", async () => {
    render(<NewAssignment courseId={MOCK_COURSE_ID} />);
    expect(screen.getByRole("heading", { level: 1, name: "Upload your assignment PDF" })).toBeDefined();

    choosePdf();
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Turn into questions" })));

    expect(screen.getByRole("heading", { level: 1, name: MOCK_DRAFT.title })).toBeDefined();
    expect(screen.getByText("From week-3.pdf")).toBeDefined();
    expect(screen.getByRole("list", { name: "Questions" })).toBeDefined();
  });

  it("starts an empty draft for a real course, with the PDF waiting for the first save", async () => {
    render(<NewAssignment courseId="course-9" />);

    choosePdf();
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Continue" })));

    expect(uploadPdf).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { level: 1, name: "week 3" })).toBeDefined();
    expect(screen.getByLabelText<HTMLInputElement>("Title").value).toBe("week 3");
    expect(screen.getByLabelText<HTMLTextAreaElement>("Question text").value).toBe("");
    expect(screen.getByText(/We can't read questions from a PDF yet/)).toBeDefined();
  });
});
