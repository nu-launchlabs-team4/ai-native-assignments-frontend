import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AuthField } from "./AuthField";

describe("AuthField", () => {
  it("shows and hides the password", () => {
    render(<AuthField label="Password" name="password" autoComplete="current-password" disabled={false} />);
    const input = screen.getByLabelText("Password");

    fireEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(input.getAttribute("type")).toBe("text");

    fireEvent.click(screen.getByRole("button", { name: "Hide password" }));
    expect(input.getAttribute("type")).toBe("password");
  });

  it("ticks the length rule for a new password as people type", () => {
    render(<AuthField label="Password" name="password" autoComplete="new-password" disabled={false} />);
    const input = screen.getByLabelText("Password");

    expect(screen.getByText("At least 8 characters")).toBeTruthy();
    fireEvent.change(input, { target: { value: "long enough" } });
    expect(screen.getByText("✓ At least 8 characters")).toBeTruthy();
  });

  it("marks the field invalid and reads the error with it", () => {
    render(
      <AuthField label="Email" name="email" autoComplete="email" disabled={false} error="Enter your email address." />,
    );
    const input = screen.getByLabelText("Email");

    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(document.getElementById(input.getAttribute("aria-describedby") ?? "")?.textContent).toBe(
      "Enter your email address.",
    );
  });
});
