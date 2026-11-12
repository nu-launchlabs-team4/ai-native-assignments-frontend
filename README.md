# AI-Native Assignments Frontend

[![CI](https://github.com/nu-launchlabs-team4/ai-native-assignments-frontend/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/nu-launchlabs-team4/ai-native-assignments-frontend/actions/workflows/ci.yml)

Next.js frontend for the AI-Native Assignments project. Students work through programming assignments in five steps (attempt, feedback, evaluate, revise, explain) with an AI tutor that helps without giving away the answer. Professors review each student's reasoning.

The frontend talks **only to our [backend](https://github.com/nu-launchlabs-team4/ai-native-assignments-backend)**, never to Supabase. The browser calls `/api/*` on this app, and Next.js forwards those calls to the backend. Sessions live in httpOnly cookies that the backend sets.

## Prerequisites

- Node 24 (see `.nvmrc`; with nvm, run `nvm install && nvm use`), or Docker Desktop
- The backend running on http://localhost:8010. Follow its README.

## Setup

```bash
git clone https://github.com/nu-launchlabs-team4/ai-native-assignments-frontend.git
cd ai-native-assignments-frontend
cp .env.example .env.local
```

`.env.local` has one value:

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8010` | The backend URL that `/api/*` is forwarded to |

Never commit `.env.local`. Never put a secret in a `NEXT_PUBLIC_` variable, because those values are sent to every browser.

## Run

**Option 1, npm:**

```bash
npm install
npm run dev
```

**Option 2, Docker:**

```bash
docker compose up --build
```

Docker Compose mounts the source for hot reload and keeps `node_modules` inside the container. It points the `/api` rewrite at `host.docker.internal:8010`, so the container can reach the backend on your machine.

Either way, open http://localhost:3000. Then open http://localhost:3000/status, where **API** and **Database** should both say **Connected**.

## Lint, type check and build

```bash
npm run lint
npm run typecheck   # next typegen, then tsc --noEmit
npm run build
```

CI runs the same three checks on every PR.

## Project layout

```
src/
  app/            pages: /, /login, /student, /professor, /status
  components/     shared UI components
  lib/
    api.ts        apiFetch: the only way to call the backend
    constants.ts  enums shared with the backend, routes, cookie names
    env.ts        environment variables
  proxy.ts        redirects to /login on student and professor pages when there is no session
```

## Contributing

1. Pick an issue from the Team 4 Sprint Board.
2. Branch from an up-to-date `main`, using the name `type/issue-number-short-name`, where `type` is `feature`, `fix`, `chore` or `docs`:
   ```bash
   git checkout main && git pull
   git checkout -b feature/5-workspace-layout
   ```
3. Make the change, then run lint, typecheck and build.
4. Open a PR with `Closes #N`. CI (the `test` check) must pass, and one approval is required before you squash merge.

Never commit `.env*` files (except `.env.example`) or any secret. This repo is public.

### Claude Code skills

If you use Claude Code, the team skills in [`.claude/skills/`](.claude/skills/) load automatically:

| Skill | Use it for |
|---|---|
| `setup-project` | First-time setup and fixing a broken local setup |
| `clean-code` | Code style for any TypeScript or TSX change |
| `git-workflow` | Branches, commits and PRs |
| `new-page` | Adding or changing a page or route |
| `api-calls` | Calling the backend, auth and error messages |
| `review-pr` | Reviewing a teammate's PR |
| `ship-pr` | Type `/ship-pr` to check, commit, push and open the PR |

Project conventions are in [CLAUDE.md](CLAUDE.md).
