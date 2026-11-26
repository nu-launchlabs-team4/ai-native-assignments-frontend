import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CurrentUserProvider } from "@/features/app-shell/current-user";
import { requestPasswordReset } from "@/features/auth/auth-client";
import { Role } from "@/lib/constants";

import { ProfileView } from "./ProfileView";

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }) }));
vi.mock("@/features/auth/auth-client", () => ({ requestPasswordReset: vi.fn(), logOut: vi.fn() }));

const resetMock = vi.mocked(requestPasswordReset);

function renderProfile() {
  render(
    <CurrentUserProvider value={{ id: "u1", email: "prof@uni.edu", role: Role.PROFESSOR }}>
      <ProfileView />
    </CurrentUserProvider>,
  );
}

beforeEach(() => {
  resetMock.mockReset();
});

describe("ProfileView", () => {
  it("shows the account's email and role", () => {
    renderProfile();

    expect(screen.getByText("prof@uni.edu")).toBeTruthy();
    expect(screen.getByText("Professor")).toBeTruthy();
    screen.getByRole("group", { name: "Appearance" });
    screen.getByRole("button", { name: "Log out" });
  });

  it("emails a reset link to the account's own address", async () => {
    resetMock.mockResolvedValue(undefined);
    renderProfile();

    fireEvent.click(screen.getByRole("button", { name: "Email me a reset link" }));

    expect((await screen.findByRole("status")).textContent).toBe("✓ Sent to prof@uni.edu");
    expect(resetMock).toHaveBeenCalledWith("prof@uni.edu");
  });
});
