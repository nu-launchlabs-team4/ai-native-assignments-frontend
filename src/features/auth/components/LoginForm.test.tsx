import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api";
import { Role } from "@/lib/constants";

import { logIn } from "../auth-client";
import { LoginForm } from "./LoginForm";

const { replace, refresh } = vi.hoisted(() => ({ replace: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace, refresh }) }));
vi.mock("../auth-client", () => ({ logIn: vi.fn() }));

const logInMock = vi.mocked(logIn);

function submit(email = "student@uni.edu", password = "correct horse") {
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: email } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: password } });
  fireEvent.click(screen.getByRole("button", { name: "Log in" }));
}

beforeEach(() => {
  replace.mockClear();
  logInMock.mockReset();
  window.history.replaceState(null, "", "/login");
});

describe("LoginForm", () => {
  it("logs in and goes to the role's home", async () => {
    logInMock.mockResolvedValue({ id: "u1", email: "prof@uni.edu", role: Role.PROFESSOR });
    render(<LoginForm />);

    submit("prof@uni.edu");

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/professor"));
    expect(logInMock).toHaveBeenCalledWith("prof@uni.edu", "correct horse");
  });

  it("returns to the page that sent people to log in", async () => {
    window.history.replaceState(null, "", "/login?next=%2Fstudent%2Fassignments%2Fa1");
    logInMock.mockResolvedValue({ id: "u1", email: "student@uni.edu", role: Role.STUDENT });
    render(<LoginForm />);

    submit();

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/student/assignments/a1"));
  });

  it("ignores a next page on another site", async () => {
    window.history.replaceState(null, "", "/login?next=%2F%2Fevil.example");
    logInMock.mockResolvedValue({ id: "u1", email: "student@uni.edu", role: Role.STUDENT });
    render(<LoginForm />);

    submit();

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/student"));
  });

  it("shows the backend's message and lets people try again", async () => {
    logInMock.mockRejectedValue(new ApiError("Wrong email or password", 401, "unauthorized", "r1"));
    render(<LoginForm />);

    submit();

    expect(await screen.findByRole("alert")).toHaveProperty("textContent", "Wrong email or password");
    expect(screen.getByRole("button", { name: "Log in" })).toHaveProperty("disabled", false);
    expect(replace).not.toHaveBeenCalled();
  });
});
