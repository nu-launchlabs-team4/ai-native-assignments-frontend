import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getMe } from "@/features/auth/auth-client";
import { ApiError } from "@/lib/api";
import { Role } from "@/lib/constants";

import { AppShell } from "./AppShell";

// One router object, like Next.js's: a new one per render would re-run effects that depend on it.
const { router, replace, pathname } = vi.hoisted(() => {
  const replace = vi.fn();
  return { replace, router: { replace, refresh: vi.fn() }, pathname: { current: "/student" } };
});
vi.mock("next/navigation", () => ({
  useRouter: () => router,
  usePathname: () => pathname.current,
}));
vi.mock("@/features/auth/auth-client", () => ({ getMe: vi.fn(), logOut: vi.fn() }));

const getMeMock = vi.mocked(getMe);
const student = { id: "u1", email: "student@uni.edu", role: Role.STUDENT };
const professor = { id: "u2", email: "prof@uni.edu", role: Role.PROFESSOR };

function renderShell(path: string) {
  pathname.current = path;
  window.history.replaceState(null, "", path);
  render(
    <AppShell>
      <p>Page content</p>
    </AppShell>,
  );
}

beforeEach(() => {
  replace.mockClear();
  getMeMock.mockReset();
});

describe("AppShell", () => {
  it("shows the student's menu, account and the page", async () => {
    getMeMock.mockResolvedValue(student);
    renderShell("/student");

    await screen.findByText("Page content");
    const menu = screen.getAllByRole("navigation", { name: "Main" })[0];
    const items = within(menu).getAllByRole("link");
    expect(items.map((link) => link.textContent)).toEqual(["Assignments"]);
    expect(items[0].getAttribute("aria-current")).toBe("page");
    expect(screen.getAllByRole("link", { name: /student@uni.edu/ })[0].getAttribute("href")).toBe("/profile");
    expect(screen.getAllByRole("button", { name: "Log out" }).length).toBeGreaterThan(0);
  });

  it("shows the professor's menu", async () => {
    getMeMock.mockResolvedValue(professor);
    renderShell("/professor");

    await screen.findByText("Page content");
    const menu = screen.getAllByRole("navigation", { name: "Main" })[0];
    expect(within(menu).getAllByRole("link").map((link) => link.textContent)).toEqual([
      "Assignments",
      "New assignment",
    ]);
  });

  it("shows the page and the area's menu straight away, before the account loads", () => {
    getMeMock.mockReturnValue(new Promise(() => {}));
    renderShell("/professor");

    screen.getByText("Page content");
    const menu = screen.getAllByRole("navigation", { name: "Main" })[0];
    expect(within(menu).getAllByRole("link")).toHaveLength(2);
  });

  it("sends people with no real session to log in, then back", async () => {
    getMeMock.mockRejectedValue(new ApiError("Your session has expired.", 401, "unauthorized", null));
    renderShell("/student");

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login?next=%2Fstudent"));
  });

  it("sends a professor on a student page to their own home", async () => {
    getMeMock.mockResolvedValue(professor);
    renderShell("/student");

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/professor"));
  });

  it("lets anyone signed in open Profile", async () => {
    getMeMock.mockResolvedValue(professor);
    renderShell("/profile");

    await screen.findByText("Page content");
    expect(replace).not.toHaveBeenCalled();
  });

  it("opens and closes the phone menu", async () => {
    getMeMock.mockResolvedValue(student);
    renderShell("/student");
    const menuButton = await screen.findByRole("button", { name: "Menu" });

    fireEvent.click(menuButton);
    expect(menuButton.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getAllByRole("navigation", { name: "Main" })).toHaveLength(2);

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.getAllByRole("navigation", { name: "Main" })).toHaveLength(1);
  });

  it("offers to try again when the account can't load", async () => {
    getMeMock.mockRejectedValueOnce(new ApiError("Can't reach the server.", 0, "network_error", null));
    getMeMock.mockResolvedValueOnce(student);
    renderShell("/student");

    fireEvent.click(await screen.findByRole("button", { name: "Try again" }));

    expect((await screen.findAllByRole("link", { name: /student@uni.edu/ })).length).toBeGreaterThan(0);
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
