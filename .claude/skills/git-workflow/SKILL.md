---
name: git-workflow
description: Team rules for branches, commits and pull requests in this repo. Use when creating a branch, naming a branch, writing a commit message, committing, pushing, or opening or merging a pull request.
---

# Git workflow

These are the same rules as the backend repo.

## Branches

Name branches `type/issue-number-short-name`, where `type` is one of `feature`, `fix`, `chore` or `docs`.

- `feature/5-workspace-layout`
- `fix/27-status-timeout`
- `chore/2-frontend-ci`

Never commit to `main`; it is protected. Always pull `main` before branching:

```bash
git checkout main && git pull
git checkout -b feature/5-workspace-layout
```

## Commits

- Keep them short and use the imperative mood: "Add workspace layout", "Fix redirect loop on login".
- Not: "added stuff", "fixes", "WIP".
- Make one logical change per commit.

## Pull requests

- One issue per PR. Aim for under 400 changed lines. The lockfile doesn't count, but say so if it changed.
- Fill in the template: What changed, Why, How to test.
- Link the issue with `Closes #N`.
- Get one approval before merging.
- Squash merge, then delete the branch.

## Before pushing

```bash
npm run lint
npm run typecheck
npm run build
git status          # no .env, .env.local or other .env* file except .env.example
```

If any `.env` file or secret is staged, unstage it (`git restore --staged <file>`) and stop.
