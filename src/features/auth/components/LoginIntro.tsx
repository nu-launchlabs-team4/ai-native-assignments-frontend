"use client";

import { studentAssignmentRoute } from "@/lib/constants";

import { useNextPath } from "../use-next-path";

const ASSIGNMENT_PREFIX = studentAssignmentRoute("");

/** Tells people where logging in takes them: back to their assignment when they came from one. */
export function LoginIntro() {
  const next = useNextPath();
  return next?.startsWith(ASSIGNMENT_PREFIX) ? "Log in to open your assignment." : "Log in to continue where you left off.";
}
