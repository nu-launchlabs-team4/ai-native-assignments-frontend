import { MAX_PDF_MB } from "@/lib/constants";

const BYTES_PER_MB = 1024 * 1024;
const PDF_TYPE = "application/pdf";

/** Why a file can't be uploaded, or `null` if it's a PDF within the size limit. */
export function pdfProblem(file: File): string | null {
  const isPdf = file.type === PDF_TYPE || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) {
    return "Choose a PDF file.";
  }
  if (file.size === 0) {
    return "This PDF is empty. Choose another file.";
  }
  if (file.size > MAX_PDF_MB * BYTES_PER_MB) {
    return `This PDF is larger than ${MAX_PDF_MB} MB. Choose a smaller file.`;
  }
  return null;
}

/** A file size for people, such as "240 KB" or "3.2 MB". */
export function formatFileSize(bytes: number): string {
  if (bytes < BYTES_PER_MB) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / BYTES_PER_MB).toFixed(1)} MB`;
}
