import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api";
import { Role } from "@/lib/constants";

import { signUp } from "../auth-client";
import { SignupForm } from "./SignupForm";

const { replace, refresh } = vi.hoisted(() => ({ replace: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace, refresh }) }));
vi.mock("../auth-client", () => ({ signUp: vi.fn() }));

const signUpMock = vi.mocked(signUp);

function submit() {
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "new@uni.edu" } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: "correct horse" } });
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

  it("asks people to confirm their email when Supabase requires it", async () => {
    signUpMock.mockResolvedValue({ user: null, confirm_email: true });
    render(<SignupForm />);

    submit();

    const status = await screen.findByRole("status");
    expect(status.textContent).toContain("new@uni.edu");
    expect(status.textContent).toContain("confirm your email");
    expect(replace).not.toHaveBeenCalled();
  });

  it("shows why the account couldn't be created", async () => {
    signUpMock.mockRejectedValue(
      new ApiError("An account with this email already exists", 409, "conflict", "r1"),
    );
    render(<SignupForm />);

    submit();

    expect((await screen.findByRole("alert")).textContent).toBe("An account with this email already exists");
  });
});
