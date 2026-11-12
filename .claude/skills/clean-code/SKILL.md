---
name: clean-code
description: Code style and structure rules for this Next.js frontend. Use whenever writing, changing or refactoring any TypeScript or TSX in src/, including pages, layouts, components, lib helpers and proxy.ts.
---

# Clean code rules

These must pass: `npm run lint`, `npm run typecheck` and `npm run build`.

## TypeScript strict, no `any`

```ts
// Good
function stepLabel(step: Step): string { ... }
const data: unknown = await response.json();

// Bad
function stepLabel(step: any) { ... }
const data = (await response.json()) as any;
```

## Small components that do one thing

```tsx
// Good
<StepStepper current={step} />
<ChatPanel locked={!attemptSaved} />

// Bad: one 400-line WorkspacePage that renders, fetches, validates and autosaves
```

## Server Components by default

Add `"use client"` only for state, effects, event handlers or browser APIs. Keep the client part as small as possible.

```tsx
// Good: the page stays a Server Component, and only the interactive part is a client one
export default function StatusPage() {
  return <PagePlaceholder title="System status"><HealthStatus /></PagePlaceholder>;
}

// Bad: "use client" at the top of a page that only renders static text
```

## Backend calls go through `lib/api.ts`

Never use raw `fetch` for backend calls, and never call Supabase (see the `api-calls` skill).

```ts
// Good
const assignment = await apiFetch<Assignment>(`/assignments/${id}`);

// Bad
const res = await fetch(`http://localhost:8010/assignments/${id}`);
```

## Shared values come from `lib/constants.ts`

```ts
// Good
if (user.role === Role.PROFESSOR) router.push(ROUTES.PROFESSOR);

// Bad
if (user.role === "professor") router.push("/professor");
```

The enums mirror `app/core/constants.py` in the backend. Change both together.

## Tailwind for styling

```tsx
// Good
<p className="text-sm text-zinc-600">...</p>

// Bad
<p style={{ fontSize: 14, color: "#52525b" }}>...</p>
```

## Accessible markup

Every input has a label. Clickable things are buttons or links. Images have alt text. Focus is visible.

```tsx
// Good
<label htmlFor="email">Email</label>
<input id="email" type="email" />
<button type="button" onClick={save} className="focus-visible:outline-2">Save</button>
<img src="/diagram.png" alt="Five steps: attempt, feedback, evaluate, revise, explain" />

// Bad
<input placeholder="Email" />
<div onClick={save}>Save</div>
<img src="/diagram.png" />
```

## Comments

Comment **why**, not what.

```ts
// Good
// Server code has no origin to resolve /api against, so it calls the backend directly.

// Bad
// call the backend
```

Exported functions in `src/lib` get a JSDoc comment:

```ts
// Good
/** Call the backend API. Throws ApiError with a user-friendly message on failure. */
export async function apiFetch<T>(path: string, init?: ApiRequestInit): Promise<T> { ... }

// Bad: an exported lib function with no doc comment
export async function apiFetch(path, init) { ... }
```

For planned work, use `TODO(name):` with an issue number:

```ts
// Good
// TODO(akashshetty1997): wire this form to the backend /auth endpoints (#3).

// Bad
// TODO: fix later
```

## No dead or commented-out code

Delete it. Git keeps the history.

```tsx
// Bad
// <OldStepper />
```
