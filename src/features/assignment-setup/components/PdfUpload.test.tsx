import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api";

import { PdfUpload } from "./PdfUpload";

const pdf = new File(["%PDF-1.7"], "week-3.pdf", { type: "application/pdf" });

function chooseFile(file: File) {
  fireEvent.change(screen.getByLabelText("Choose a PDF or drag it here"), { target: { files: [file] } });
}

describe("PdfUpload", () => {
  it("uploads the chosen PDF and says it is reading it", async () => {
    let finish = () => {};
    const onUpload = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    render(<PdfUpload onUpload={onUpload} />);

    chooseFile(pdf);
    expect(screen.getByText(/week-3\.pdf/)).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Turn into questions" }));

    expect(onUpload).toHaveBeenCalledWith(pdf);
    expect(screen.getByRole("button", { name: "Reading your PDF…" })).toHaveProperty("disabled", true);
    expect(screen.getByRole("status").textContent).toMatch(/Finding each question/);
    await act(async () => finish());
  });

  it("rejects a file that is not a PDF without uploading it", () => {
    const onUpload = vi.fn(async () => {});
    render(<PdfUpload onUpload={onUpload} />);

    chooseFile(new File(["hi"], "notes.docx", { type: "application/msword" }));
    fireEvent.click(screen.getByRole("button", { name: "Turn into questions" }));

    expect(screen.getByRole("alert").textContent).toBe("Choose a PDF first.");
    expect(onUpload).not.toHaveBeenCalled();
  });

  it("explains why a non-PDF was rejected", () => {
    render(<PdfUpload onUpload={vi.fn(async () => {})} />);

    chooseFile(new File(["hi"], "notes.docx", { type: "application/msword" }));

    expect(screen.getByRole("alert").textContent).toBe("Choose a PDF file.");
  });

  it("accepts a PDF dropped on the drop area", () => {
    render(<PdfUpload onUpload={vi.fn(async () => {})} />);

    fireEvent.drop(screen.getByText("Choose a PDF or drag it here"), { dataTransfer: { files: [pdf] } });

    expect(screen.getByText(/week-3\.pdf/)).toBeDefined();
  });

  it("shows the backend's message when the upload fails, and lets the professor try again", async () => {
    const onUpload = vi.fn(async () => {
      throw new ApiError("Too many requests. Please wait a moment and try again.", 429, "rate_limited", null);
    });
    render(<PdfUpload onUpload={onUpload} />);

    chooseFile(pdf);
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Turn into questions" })));

    expect(screen.getByRole("alert").textContent).toMatch(/Too many requests/);
    expect(screen.getByRole("button", { name: "Turn into questions" })).toHaveProperty("disabled", false);
  });
});
