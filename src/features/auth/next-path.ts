import { ROUTES } from "@/lib/constants";

/**
 * The `?next=` page to return to after logging in, or null when it isn't safe.
 * Only paths on this site count: "//evil.com" or "https://…" would send people elsewhere.
 */
export function safeNextPath(next: string | null): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return null;
  }
  const authPages = [ROUTES.LOGIN, ROUTES.SIGNUP, ROUTES.FORGOT_PASSWORD, ROUTES.RESET_PASSWORD];
  if (authPages.some((page) => next.startsWith(page))) {
    return null;
  }
  return next;
}
