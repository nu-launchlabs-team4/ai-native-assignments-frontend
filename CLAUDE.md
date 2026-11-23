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
    layout.tsx, page.tsx   root layout; page.tsx renders the landing page
    login/, signup/, forgot-password/, reset-password/
                           the auth pages (the forms live in features/auth)
    student/page.tsx       student landing page (links to the sample assignment)
    student/assignments/[assignmentId]/
                           the five-step workspace: page.tsx, error.tsx, not-found.tsx
    professor/page.tsx     placeholder for assignment setup and submissions
    status/page.tsx        calls /api/health and shows API and database status
  features/
    auth/                  LoginForm, SignupForm, ForgotPasswordForm, ResetPasswordForm, LogoutButton,
                           auth-client.ts (the /auth calls), validation.ts,
                           next-path.ts (safe ?next= redirects)
    landing/               the public landing page (Northeastern black, white and red): header, hero,
                           StepStrip, two RoleCard links, footer
    workspace/             the student workspace feature
      components/          WorkspaceLoader (starts the submission), Workspace, WorkspaceShell,
                           AssignmentPanel + QuestionList + FinishAttemptPanel (+ ConfidenceRating),
                           AnswerPanel + AnswerEditor (CodeEditor | TextAnswer | MathAnswer),
                           StepStepper, StatusBar, ... (+ *.test.tsx)
      use-attempt.ts       step 1 state: answers, autosave of changed answers every 30 s, submit
      submission-client.ts SubmissionClient: the real /submissions API, or the mock for the demo id
      mock-submission-client.ts  in-browser stand-in with the backend's rules, used only for "sample-1"
      map-submission.ts    SubmissionOut -> what the panes show (paragraphs, file names, answers)
      types.ts             WorkspaceAssignment, WorkspaceQuestion (code | text | math)
      mock-assignment.ts   the demo assignment, in the backend's AssignmentOut shape
  components/              UI shared across features (PagePlaceholder, HealthStatus, AppearanceControl, ProductMark)
    ui/                    small building blocks used everywhere (Button, SegmentedControl, Panel)
  lib/
    api.ts                 apiFetch: the only way to call the backend
    api-types.ts           QuestionOut, AssignmentOut, SubmissionOut: mirrors of the backend schemas
    constants.ts           enums mirrored from the backend (AnswerType is new, see backend #6), plus ROUTES, API_PATHS,
                           SESSION_COOKIES and THEME_STORAGE_KEY
    theme.ts               useTheme and setTheme (client only)
    theme-init.ts          the pre-paint theme script used by the root layout
    env.ts                 reads and checks NEXT_PUBLIC_API_URL
  proxy.ts                 redirects to /login when there is no session cookie on /student or /professor
```

## How it talks to the backend

- **The frontend never talks to Supabase.** There are no Supabase packages or keys here. Only the backend talks to Supabase.
- **All data and auth go through the backend.** The browser calls `/api/*` on the frontend's own origin, and `next.config.ts` rewrites it to `NEXT_PUBLIC_API_URL`. The calls are same-origin, so there's no CORS, and the backend's cookies are first-party.
- **Sessions live in httpOnly cookies** set by the backend's `/auth/*` endpoints (backend #4). The frontend never reads, stores or verifies tokens. `apiFetch` sends `credentials: "include"`. When a call gets 401 (the access cookie lasts an hour), `apiFetch` calls `/auth/refresh` once and retries, so people stay logged in while they work.
- **Roles come from the backend.** Sign-up has no role choice: the backend makes professors from its `PROFESSOR_EMAILS` allowlist. After log-in, `homeRouteFor(role)` picks the landing page.
- `src/proxy.ts` only checks whether a session cookie exists, so it can redirect quickly. The backend does the real session and role check on every request.
- Backend errors have the shape `{"error": {"code", "message", "request_id"}}`. `apiFetch` turns them into a typed `ApiError` with friendly messages for 401, 403 and 429.
- `lib/constants.ts` mirrors `app/core/constants.py` in the backend. Change both together.

## Commands

```bash
npm run dev            # http://localhost:3000 (or: docker compose up --build)
npm run lint
npm run typecheck      # next typegen, then tsc --noEmit
npm test               # Vitest + React Testing Library
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
- **Feature folders:** UI for one feature lives in `src/features/<feature>/` (`components/`, `types.ts`, and helpers). UI shared by several features goes in `src/components/`, and small building blocks go in `src/components/ui/`. Pages in `src/app` stay thin: read params, load data, and render a feature component.
- Keep components small, each doing one thing. Pass data in through props. A layout component takes slots (`ReactNode` props) instead of importing its children.
- Every component with logic or states gets a colocated `*.test.tsx` using React Testing Library. Query by role and label, the way a user finds things. Mock Monaco and other browser-only libraries.
- Use Server Components by default, and `"use client"` only when needed.
- Every backend call goes through `src/lib/api.ts`. Never use raw `fetch` to the backend, and never call Supabase.
- Shared values come from `src/lib/constants.ts`. No magic strings.
- **Design follows Apple's Human Interface Guidelines** (issue #36). Style with Tailwind, no inline style objects, and use the **design tokens** from `src/app/globals.css` instead of picking colors by hand:
  - Colors: `bg-background`, `bg-surface` (content), `bg-surface-muted` (bars, sidebars), `text-foreground`, `text-muted` (secondary text), `border-line` (separators only), `border-field` (text fields and controls), `bg-accent` / `text-accent-foreground` (the main action), `bg-accent-soft` (tinted), `bg-fill` / `bg-fill-selected` (control tracks such as the segmented control, visible on both the page and a card), `text-success` / `text-warning` / `text-danger`, and `outline-focus` for every keyboard focus ring (black in light, white in dark). The `brand-*` tokens (Northeastern red #C8102E on black and white) are for the landing page only: on app screens red would read as `danger`. Every text pairing meets 4.5:1 in light and dark, and the comments in `globals.css` give the ratios.
  - Type: the **IBM Plex** family from `src/lib/fonts.ts`: Plex Sans for text (`font-sans`, the default), Plex Serif for titles (`font-serif`, which every `h1` uses), and Plex Mono for code (`font-mono`, and the Monaco editor). next/font self-hosts them, so there are no requests to Google. Sizes come from the scale `text-large-title`, `text-title`, `text-headline`, `text-body`, `text-callout`, `text-footnote` and `text-caption` (12 px, the minimum).
  - Controls: use `Button` (`filled` for the one main action, `tinted`, `plain`) and `SegmentedControl` from `src/components/ui`. They include a press state and 44 px touch targets (`pointer-coarse:`). A custom control needs both.
  - Motion stays brief and optional: guard repeating animations with `motion-safe:`.
- **Appearance:** follows the device's light or dark setting by default (Apple's rule). `AppearanceControl` (System, Light, Dark) lets people override it, and the choice is remembered in localStorage. Dark mode is the `.dark` class on `<html>`, set before paint by `theme-init.ts`. Modules that use React hooks stay out of Server Components (that's why `theme-init.ts` is separate from `theme.ts`).
- **Assignments are lists of questions**, each with an `AnswerType`: `code` (Monaco), `text` (written) or `math` (MathLive, stored as LaTeX lines). The PDF parser detects the type, and the professor can correct it. Add a new answer type in `AnswerType`, the `WorkspaceQuestion` union and `AnswerEditor`. TypeScript then flags every switch that misses it.
- Write accessible markup: labels on inputs, buttons not divs, alt text and visible keyboard focus.
- Comment why, not what. Exported functions in `src/lib` get JSDoc. Use `TODO(name):` with an issue number.
- Don't leave dead or commented-out code.
- Never commit secrets or any `.env*` file except `.env.example`, and never print `.env.local`. This repo is public, and `NEXT_PUBLIC_` values ship to every browser.
- Keep PRs small, with one issue each.
