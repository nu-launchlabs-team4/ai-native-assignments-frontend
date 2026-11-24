import { describe, expect, it } from "vitest";

import { MAX_PDF_MB } from "@/lib/constants";

import { formatFileSize, pdfProblem } from "./pdf";

function file(name: string, size: number, type = "application/pdf"): File {
  const upload = new File(["x"], name, { type });
  Object.defineProperty(upload, "size", { value: size });
  return upload;
}

describe("pdfProblem", () => {
  it("accepts a PDF within the size limit", () => {
    expect(pdfProblem(file("week-3.pdf", 2048))).toBeNull();
  });

  it("accepts a .pdf file even when the browser gives no type", () => {
    expect(pdfProblem(file("week-3.PDF", 2048, ""))).toBeNull();
  });

  it("rejects other file types, empty files and files over the limit", () => {
    expect(pdfProblem(file("notes.docx", 2048, "application/msword"))).toBe("Choose a PDF file.");
    expect(pdfProblem(file("empty.pdf", 0))).toMatch(/empty/);
    expect(pdfProblem(file("big.pdf", MAX_PDF_MB * 1024 * 1024 + 1))).toMatch(`larger than ${MAX_PDF_MB} MB`);
  });
});

describe("formatFileSize", () => {
  it.each([
    [300, "1 KB"],
    [240 * 1024, "240 KB"],
    [3.2 * 1024 * 1024, "3.2 MB"],
  ])("formats %i bytes as %s", (bytes, expected) => {
    expect(formatFileSize(bytes)).toBe(expected);
  });
});
