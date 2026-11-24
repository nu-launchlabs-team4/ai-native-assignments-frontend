import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api";
import { Role } from "@/lib/constants";

import { resetPassword } from "../auth-client";
import { ResetPasswordForm } from "./ResetPasswordForm";

const { replace, refresh } = vi.hoisted(() => ({ replace: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace, refresh }) }));
vi.mock("../auth-client", () => ({ resetPassword: vi.fn() }));

const resetMock = vi.mocked(resetPassword);

function submit(password = "a new password") {
  fireEvent.change(screen.getByLabelText("New password"), { target: { value: password } });
  fireEvent.click(screen.getByRole("button", { name: "Save password and log in" }));
}

beforeEach(() => {
  replace.mockClear();
  resetMock.mockReset();
  window.history.replaceState(null, "", "/reset-password?token_hash=hash-1&type=recovery");
});

describe("ResetPasswordForm", () => {
  it("saves the password with the link's code and goes home, logged in", async () => {
    resetMock.mockResolvedValue({ id: "u1", email: "student@uni.edu", role: Role.STUDENT });
    render(<ResetPasswordForm />);

    submit();

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/student"));
    expect(resetMock).toHaveBeenCalledWith("hash-1", "a new password");
  });

  it("checks the length rule before using the one-time link", () => {
    render(<ResetPasswordForm />);

    submit("short");

    expect(screen.getByText("Choose a password with at least 8 characters.")).toBeTruthy();
    expect(resetMock).not.toHaveBeenCalled();
  });

  it("offers a new link when this one has expired", async () => {
    resetMock.mockRejectedValue(
      new ApiError("This reset link has expired or was already used. Request a new one.", 400, "bad_request", "r1"),
    );
    render(<ResetPasswordForm />);

    submit();

    expect((await screen.findByRole("alert")).textContent).toContain("expired");
    expect(screen.getByRole("link", { name: "Request a new link" }).getAttribute("href")).toBe("/forgot-password");
  });

  it("explains a link without its code", () => {
    window.history.replaceState(null, "", "/reset-password");

    render(<ResetPasswordForm />);

    expect(screen.getByRole("alert").textContent).toContain("incomplete");
    expect(screen.queryByLabelText("New password")).toBeNull();
  });
});
