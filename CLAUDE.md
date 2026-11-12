# CLAUDE.md

@AGENTS.md

## Project

Frontend for **AI-Native Assignments**. Professors turn programming assignments into a five-step flow: attempt, feedback, evaluate, revise, explain. Students work through the steps with an AI tutor that helps without giving away the answer. Professors then review each student's reasoning trail.

The backend lives in [`nu-launchlabs-team4/ai-native-assignments-backend`](https://github.com/nu-launchlabs-team4/ai-native-assignments-backend) and runs locally on http://localhost:8010.

## Stack

- Next.js 16 (App Router, Turbopack, **Cache Components** on), React 19, TypeScript (strict), Tailwind CSS 4, ESLint
- Node 24 (`.nvmrc`)
- npm, or Docker Compose (service `web`) on http://localhost:3000

Next.js 16 differs from older versions. For example, `middleware.ts` is now `proxy.ts`, and reading request data outside `<Suspense>` is a build error. Check `node_modules/next/dist/docs/` before using an API you're unsure about.

## Layout

```
src/
  app/
    layout.tsx, page.tsx   landing page with links to Login, Student and Professor
    login/page.tsx         placeholder login form (wired to the backend in #3)
    student/page.tsx       placeholder for the five-step workspace
    professor/page.tsx     placeholder for assignment setup and submissions
    status/page.tsx        calls /api/health and shows API and database status
  components/              shared UI components
  lib/
    api.ts                 apiFetch: the only way to call the backend
    constants.ts           enums mirrored from the backend, plus ROUTES, API_PATHS and SESSION_COOKIES
    env.ts                 reads and checks NEXT_PUBLIC_API_URL
  proxy.ts                 redirects to /login when there is no session cookie on /student or /professor
```

## How it talks to the backend

- **The frontend never talks to Supabase.** There are no Supabase packages or keys here. Only the backend talks to Supabase.
- **All data and auth go through the backend.** The browser calls `/api/*` on the frontend's own origin, and `next.config.ts` rewrites it to `NEXT_PUBLIC_API_URL`. The calls are same-origin, so there's no CORS, and the backend's cookies are first-party.
- **Sessions live in httpOnly cookies** set by the backend's `/auth/*` endpoints (backend #4). The frontend never reads, stores or verifies tokens. `apiFetch` sends `credentials: "include"`.
- `src/proxy.ts` only checks whether a session cookie exists, so it can redirect quickly. The backend does the real session and role check on every request.
- Backend errors have the shape `{"error": {"code", "message", "request_id"}}`. `apiFetch` turns them into a typed `ApiError` with friendly messages for 401, 403 and 429.
- `lib/constants.ts` mirrors `app/core/constants.py` in the backend. Change both together.

## Commands

```bash
npm run dev            # http://localhost:3000 (or: docker compose up --build)
npm run lint
npm run typecheck      # next typegen, then tsc --noEmit
npm run build
```

## Skills

Team skills live in `.claude/skills/`. Use the one that matches the task.

| Skill | When it applies |
|---|---|
| `setup-project` | A teammate is setting up the frontend for the first time, or local setup breaks (port busy, missing env, `/status` unreachable). |
| `clean-code` | Writing or changing any TypeScript or TSX. |
| `git-workflow` | Creating a branch, committing, or opening or merging a PR. |
| `new-page` | Adding or changing a page or route under `src/app`. |
| `api-calls` | Any code that calls the backend, handles auth or sessions, or shows API errors. |
| `review-pr` | Reviewing a teammate's pull request. |
| `ship-pr` | Only when someone types `/ship-pr`. It checks, commits, pushes and opens the PR. |

## Rules

- Branch names follow `type/issue-number-short-name`, where `type` is `feature`, `fix`, `chore` or `docs`. For example, `feature/5-workspace-layout`. Never commit to `main`. See the `git-workflow` skill.
- Use strict TypeScript with no `any`.
- Keep components small, each doing one thing.
- Use Server Components by default, and `"use client"` only when needed.
- Every backend call goes through `src/lib/api.ts`. Never use raw `fetch` to the backend, and never call Supabase.
- Shared values come from `src/lib/constants.ts`. No magic strings.
- Style with Tailwind. No inline style objects.
- Write accessible markup: labels on inputs, buttons not divs, alt text and visible keyboard focus.
- Comment why, not what. Exported functions in `src/lib` get JSDoc. Use `TODO(name):` with an issue number.
- Don't leave dead or commented-out code.
- Never commit secrets or any `.env*` file except `.env.example`, and never print `.env.local`. This repo is public, and `NEXT_PUBLIC_` values ship to every browser.
- Keep PRs small, with one issue each.
