---
name: new-page
description: Checklist for adding or changing a page or route in this Next.js App Router frontend. Use when creating a page.tsx, layout.tsx, loading.tsx or error.tsx under src/app, adding a route, or protecting a page by role.
---

# Add or change a page

Also follow the `clean-code` and `api-calls` skills. This is Next.js 16 with **Cache Components** enabled. When unsure, read the guide in `node_modules/next/dist/docs/`.

1. **Add the route** under `src/app/<segment>/page.tsx`, and add its path to `ROUTES` in `src/lib/constants.ts`. Export `metadata` with a `title`.

2. **Keep data fetching in Server Components or `lib`.**
   - The page is a Server Component. Push `"use client"` down to the small interactive parts.
   - With Cache Components, anything that reads request data (cookies, headers or uncached fetches) must sit inside a `<Suspense>` boundary, or the build fails. Keep it out of layouts' top level.
   - Data that runs in the browser goes through `apiFetch` in `src/lib/api.ts`.

3. **Handle loading and error states** consistently:
   - `loading.tsx` or a `<Suspense fallback>` for slow sections
   - `error.tsx` (a Client Component) for errors in the segment
   - An `ApiError` message shown inline, near the action that failed. 403 and 429 messages already come out friendly from `apiFetch`.
   - Empty states written for people ("No submissions yet"), not blank tables

4. **Protect pages by role:**
   - `src/proxy.ts` redirects visitors with **no session cookie** away from `/student/*` and `/professor/*`. If you add a new protected section, add it to the proxy `matcher`.
   - The proxy doesn't verify anything. The **backend** checks the session and the role on every API call. When the backend returns 401, send the user to login. When it returns 403, show the message.
   - Never decide access from client-side state alone, and never read the session cookie in the frontend.

5. **Match the design prototype layout** for the page. For example, the student workspace has the instructions, a Monaco editor, a five-step stepper and an AI panel on the right. Use Tailwind and the shared components in `src/components`.

6. **Make it accessible:** labels on inputs, buttons for actions, links for navigation, visible focus, a sensible heading order (one `h1`) and alt text.

7. **Check:**
   - `npm run dev`, then open the page while signed out (it should redirect) and while signed in.
   - `npm run lint`, `npm run typecheck` and `npm run build`.
