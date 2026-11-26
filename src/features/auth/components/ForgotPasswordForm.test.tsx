import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api";

import { requestPasswordReset } from "../auth-client";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

vi.mock("../auth-client", () => ({ requestPasswordReset: vi.fn() }));

const requestMock = vi.mocked(requestPasswordReset);

function submit(email: string) {
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: email } });
  fireEvent.click(screen.getByRole("button", { name: "Send reset link" }));
}

beforeEach(() => {
  requestMock.mockReset();
});

describe("ForgotPasswordForm", () => {
  it("sends the link and says so without confirming the account exists", async () => {
    requestMock.mockResolvedValue(undefined);
    render(<ForgotPasswordForm />);

    submit("student@uni.edu");

    await screen.findByRole("heading", { name: "Check your email" });
    expect(requestMock).toHaveBeenCalledWith("student@uni.edu");
    expect(screen.getByText(/If there's an account for/)).toBeTruthy();
  });

  it("checks the email first", () => {
    render(<ForgotPasswordForm />);

    submit("student");

    expect(screen.getByText("Enter an email address like name@university.edu.")).toBeTruthy();
    expect(requestMock).not.toHaveBeenCalled();
  });

  it("explains when too many links were asked for", async () => {
    requestMock.mockRejectedValue(new ApiError("Too many attempts. Try again in a minute", 429, "too_many_requests", null));
    render(<ForgotPasswordForm />);

    submit("student@uni.edu");

    expect((await screen.findByRole("alert")).textContent).toBe("Too many attempts. Try again in a minute");
  });
});
