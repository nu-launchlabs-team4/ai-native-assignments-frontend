---
name: review-pr
description: Checklist for reviewing a teammate's pull request in this frontend repo. Use when asked to review a PR, look over a branch or diff before merge, or leave review comments.
---

# Review a pull request

Get the context first:
```bash
gh pr view <N>
gh pr diff <N>
gh pr checks <N>
```

## Checklist

- [ ] **Matches the linked issue.** The PR has `Closes #N`, and it meets the issue's acceptance criteria with no unrelated changes. It aims for under 400 changed lines.
- [ ] **CI is green.** The `test` check passes: lint, typecheck and build.
- [ ] **Follows the clean-code rules:**
  - strict TypeScript with no `any`
  - small components
  - Server Components by default, with `"use client"` only where needed
  - backend calls only through `apiFetch`
  - values from `lib/constants.ts`
  - Tailwind only
  - JSDoc on `lib` exports
  - `TODO(name): (#N)` format for TODOs
  - no dead code
- [ ] **Accessible:**
  - every input has a label
  - buttons for actions, not clickable divs
  - links for navigation
  - alt text on images
  - visible keyboard focus
  - one `h1` and a sensible heading order
- [ ] **No secrets:**
  - no `.env*` file other than `.env.example`
  - no keys or tokens in code
  - nothing secret behind a `NEXT_PUBLIC_` prefix
  - no `@supabase/*` packages
- [ ] **Role checks on pages.** New student or professor pages are covered by the `src/proxy.ts` matcher. 401 sends the user to login, and 403 shows the backend's message. Nothing grants access from client state alone.
- [ ] **Consistent loading and error states:**
  - Suspense or `loading.tsx` for slow parts
  - `error.tsx` where a segment can fail
  - `ApiError` messages shown near the action
  - friendly empty states

## Comments

Be kind and specific, and suggest a fix:

> Good: "This calls `fetch('http://localhost:8010/...')` directly, which skips the cookie and error handling. Could it use `apiFetch('/assignments')` instead?"

> Bad: "Don't do this."

Approve when the checklist passes. Request changes only for real problems, such as bugs, security or accessibility issues or broken rules, not for personal style.
