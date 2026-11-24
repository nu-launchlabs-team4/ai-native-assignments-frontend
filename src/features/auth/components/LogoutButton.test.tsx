import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api";

import { logOut } from "../auth-client";
import { LogoutButton } from "./LogoutButton";

const { replace, refresh } = vi.hoisted(() => ({ replace: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace, refresh }) }));
vi.mock("../auth-client", () => ({ logOut: vi.fn() }));

const logOutMock = vi.mocked(logOut);

beforeEach(() => {
  replace.mockClear();
  logOutMock.mockReset();
});

describe("LogoutButton", () => {
  it("logs out and goes to the login page", async () => {
    logOutMock.mockResolvedValue(undefined);
    render(<LogoutButton />);

    fireEvent.click(screen.getByRole("button", { name: "Log out" }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
  });

  it("stays put and explains when logging out fails", async () => {
    logOutMock.mockRejectedValue(new ApiError("Can't reach the server.", 0, "network_error", null));
    render(<LogoutButton />);

    fireEvent.click(screen.getByRole("button", { name: "Log out" }));

    expect((await screen.findByRole("alert")).textContent).toBe("Can't reach the server.");
    expect(replace).not.toHaveBeenCalled();
  });
});
