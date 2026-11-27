import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api";
import { Role } from "@/lib/constants";

import { signUp } from "../auth-client";
import { SignupForm } from "./SignupForm";

const { replace, refresh } = vi.hoisted(() => ({ replace: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace, refresh }) }));
vi.mock("../auth-client", () => ({ signUp: vi.fn(), resendConfirmation: vi.fn() }));

const signUpMock = vi.mocked(signUp);

function submit(password = "correct horse") {
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "new@uni.edu" } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: password } });
  fireEvent.click(screen.getByRole("button", { name: "Create account" }));
}

beforeEach(() => {
  replace.mockClear();
  signUpMock.mockReset();
});

describe("SignupForm", () => {
  it("has no role choice: the backend decides the role", () => {
    render(<SignupForm />);

    expect(screen.queryByRole("radio")).toBeNull();
    expect(screen.queryByRole("combobox")).toBeNull();
  });

  it("goes to the role's home when the account is ready", async () => {
    signUpMock.mockResolvedValue({
      user: { id: "u1", email: "new@uni.edu", role: Role.STUDENT },
      confirm_email: false,
    });
    render(<SignupForm />);

    submit();

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/student"));
  });

  it("explains a short password next to the field, without calling the backend", () => {
    render(<SignupForm />);

    submit("short");

    expect(screen.getByLabelText("Password").getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByText("Choose a password with at least 8 characters.")).toBeTruthy();
    expect(signUpMock).not.toHaveBeenCalled();
  });

  it("puts a taken email's message under the email field", async () => {
    signUpMock.mockRejectedValue(new ApiError("An account with this email already exists", 409, "conflict", "r1"));
    render(<SignupForm />);

    submit();

    const email = screen.getByLabelText("Email");
    await waitFor(() => expect(email.getAttribute("aria-invalid")).toBe("true"));
    const describedBy = email.getAttribute("aria-describedby") ?? "";
    expect(document.getElementById(describedBy.split(" ")[0])?.textContent).toBe(
      "An account with this email already exists",
    );
  });

  it("asks people to confirm their email, with a way to log in or fix the address", async () => {
    signUpMock.mockResolvedValue({ user: null, confirm_email: true });
    render(<SignupForm />);

    submit();

    const heading = await screen.findByRole("heading", { name: "Check your email" });
    expect(document.activeElement).toBe(heading);
    expect(screen.getByText("new@uni.edu")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Go to log in" }).getAttribute("href")).toBe("/login");
    expect(screen.getByRole("button", { name: "Send the link again" })).toBeTruthy();
    expect(replace).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Use a different email" }));

    expect(screen.getByRole("button", { name: "Create account" })).toBeTruthy();
  });
});
