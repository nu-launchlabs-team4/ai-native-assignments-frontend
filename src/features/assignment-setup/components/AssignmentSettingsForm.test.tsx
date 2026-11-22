import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AIPolicy, FinalCheck, HelpLevel } from "@/lib/constants";

import type { AssignmentSettings } from "../types";
import { AssignmentSettingsForm } from "./AssignmentSettingsForm";

const SETTINGS: AssignmentSettings = {
  ai_policy: AIPolicy.PERMITTED,
  help_level: HelpLevel.HINTS,
  final_check: FinalCheck.AI_INTERVIEW,
};

describe("AssignmentSettingsForm", () => {
  it("shows the three groups with the current choices selected", () => {
    render(<AssignmentSettingsForm settings={SETTINGS} onChange={vi.fn()} />);

    expect(screen.getByRole("group", { name: "AI policy" })).toBeDefined();
    expect(screen.getByRole("group", { name: "AI help level" })).toBeDefined();
    expect(screen.getByRole("group", { name: "Final check" })).toBeDefined();
    expect(screen.getByRole<HTMLInputElement>("radio", { name: "Permitted" }).checked).toBe(true);
    expect(screen.getByRole<HTMLInputElement>("radio", { name: "Hints only" }).checked).toBe(true);
    expect(screen.getByRole<HTMLInputElement>("radio", { name: "AI follow-up interview" }).checked).toBe(true);
  });

  it("sends the new choice and keeps the other settings", () => {
    const onChange = vi.fn();
    render(<AssignmentSettingsForm settings={SETTINGS} onChange={onChange} />);

    fireEvent.click(screen.getByRole("radio", { name: "Fixed questionnaire" }));

    expect(onChange).toHaveBeenCalledWith({ ...SETTINGS, final_check: FinalCheck.QUESTIONNAIRE });
  });
});
