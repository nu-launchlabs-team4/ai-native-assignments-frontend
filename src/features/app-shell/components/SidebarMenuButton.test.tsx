import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getMe } from "@/features/auth/auth-client";
import { ApiError } from "@/lib/api";
import { Role } from "@/lib/constants";

import { SidebarMenuButton } from "./SidebarMenuButton";

const { router, replace } = vi.hoisted(() => {
  const replace = vi.fn();
  return { replace, router: { replace, refresh: vi.fn() } };
});
vi.mock("next/navigation", () => ({
  useRouter: () => router,
  usePathname: () => "/student/assignments/sample-1",
}));
vi.mock("@/features/auth/auth-client", () => ({ getMe: vi.fn(), logOut: vi.fn() }));

const getMeMock = vi.mocked(getMe);

beforeEach(() => {
  replace.mockClear();
  getMeMock.mockReset();
});

describe("SidebarMenuButton", () => {
  it("opens the menu with the account, and closes it", async () => {
    getMeMock.mockResolvedValue({ id: "u1", email: "student@uni.edu", role: Role.STUDENT });
    render(<SidebarMenuButton />);
    const button = screen.getByRole("button", { name: "Show menu" });

    fireEvent.click(button);

    const dialog = screen.getByRole("dialog", { name: "Menu" });
    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(within(dialog).getByRole("link", { name: "Assignments" }).getAttribute("href")).toBe("/student");
    expect(await within(dialog).findByRole("link", { name: /student@uni.edu/ })).toBeTruthy();

    fireEvent.click(within(dialog).getByRole("button", { name: "Close menu" }));
    expect(button.getAttribute("aria-expanded")).toBe("false");
  });

  it("sends people with no real session to log in", async () => {
    getMeMock.mockRejectedValue(new ApiError("Your session has expired.", 401, "unauthorized", null));
    render(<SidebarMenuButton />);

    fireEvent.click(screen.getByRole("button", { name: "Show menu" }));

    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith("/login?next=%2Fstudent%2Fassignments%2Fsample-1"),
    );
  });
});
