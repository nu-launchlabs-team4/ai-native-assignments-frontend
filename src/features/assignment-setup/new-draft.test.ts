import { describe, expect, it } from "vitest";

import { blankDraft, isUnsaved, NEW_ASSIGNMENT_ID, titleFromFileName } from "./new-draft";

describe("titleFromFileName", () => {
  it("turns a file name into a readable title", () => {
    expect(titleFromFileName("week-3_counting--loops.PDF")).toBe("week 3 counting loops");
  });

  it("falls back when nothing is left", () => {
    expect(titleFromFileName(".pdf")).toBe("Untitled assignment");
  });

  it("keeps within the backend's 200 characters", () => {
    expect(titleFromFileName(`${"a".repeat(300)}.pdf`)).toHaveLength(200);
  });
});

describe("blankDraft", () => {
  it("is an unsaved draft in the course with one empty written question", () => {
    const draft = blankDraft("c1", new File(["%PDF"], "loops.pdf"));

    expect(draft.id).toBe(NEW_ASSIGNMENT_ID);
    expect(isUnsaved(draft)).toBe(true);
    expect(draft.course_id).toBe("c1");
    expect(draft.source_pdf).toBe("loops.pdf");
    expect(draft.published_at).toBeNull();
    expect(draft.questions).toHaveLength(1);
    expect(draft.questions[0]).toMatchObject({ position: 1, prompt: "", answer_type: "text", language: null });
  });
});
