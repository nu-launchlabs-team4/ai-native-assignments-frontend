import { type NextRequest, NextResponse } from "next/server";

import { ROUTES, SESSION_COOKIES } from "@/lib/constants";

// Next.js 16 renamed middleware.ts to proxy.ts.
// This is only a fast redirect for visitors with no session cookie. It does not
// verify anything: the backend checks the cookie and the role on every request.
export function proxy(request: NextRequest) {
  const hasSession = SESSION_COOKIES.some((name) => request.cookies.has(name));
  if (hasSession) {
    return NextResponse.next();
  }

  const loginUrl = new URL(ROUTES.LOGIN, request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Pages that need a signed-in user. Must be literal strings so Next.js can read them at build time.
  matcher: ["/student/:path*", "/professor/:path*"],
};
