import { describe, expect, it } from "vitest";

import { Role } from "@/lib/constants";

import { areaRoleFor } from "./nav-items";

describe("areaRoleFor", () => {
  it.each([
    ["/student", Role.STUDENT],
    ["/student/assignments/a1", Role.STUDENT],
    ["/professor", Role.PROFESSOR],
    ["/professor/assignments/new", Role.PROFESSOR],
    ["/profile", null],
    ["/studentish", null],
  ])("%s belongs to %s", (pathname, role) => {
    expect(areaRoleFor(pathname)).toBe(role);
  });
});
