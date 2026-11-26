import { beforeEach, describe, expect, it } from "vitest";

import { aiDeclarationText, EMPTY_DRAFT, loadInterviewDraft } from "./interview";

describe("aiDeclarationText", () => {
  it("builds one readable sentence", () => {
    expect(aiDeclarationText("tutor-only", "")).toBe("Used only this app's AI tutor.");
    expect(aiDeclarationText("other-tools", "  ChatGPT for Big-O  ")).toBe("Also used other AI tools: ChatGPT for Big-O");
  });

  it("is incomplete without a choice, or without details for other tools", () => {
    expect(aiDeclarationText(null, "")).toBeNull();
    expect(aiDeclarationText("other-tools", "   ")).toBeNull();
  });
});

describe("loadInterviewDraft", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("starts empty, and ignores a damaged draft", () => {
    expect(loadInterviewDraft("sub-1")).toEqual(EMPTY_DRAFT);
    window.localStorage.setItem("interview-draft:sub-1", "{not json");
    expect(loadInterviewDraft("sub-1")).toEqual(EMPTY_DRAFT);
    window.localStorage.setItem("interview-draft:sub-1", JSON.stringify({ answers: "x", aiUse: "everything" }));
    expect(loadInterviewDraft("sub-1")).toEqual(EMPTY_DRAFT);
  });
});
