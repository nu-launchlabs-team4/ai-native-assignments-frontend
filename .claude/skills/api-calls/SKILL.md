---
name: api-calls
description: Rules for calling the backend from the frontend. Use whenever code fetches or sends data, handles login, logout or sessions, shows API errors, or someone suggests calling Supabase or another service directly from the browser.
---

# Calling the backend

## Always use `apiFetch` from `src/lib/api.ts`

```ts
import { ApiError, apiFetch } from "@/lib/api";

const assignment = await apiFetch<Assignment>(`/assignments/${id}`);
await apiFetch<StepEntry>(`/submissions/${id}/attempt`, { method: "POST", body: attempt });
```

`apiFetch` handles all of this:
- In the browser, it calls `/api/...` on the same origin. `next.config.ts` rewrites that to the backend (`NEXT_PUBLIC_API_URL`).
- It sends `credentials: "include"`, so the backend's **httpOnly session cookies** go along automatically.
- It sends a plain object as JSON and `FormData` as-is, for PDF uploads.
- It reads the backend error shape `{"error": {"code", "message", "request_id"}}` and throws a typed `ApiError` with `status`, `code`, `requestId` and a friendly `message`.

Never write raw `fetch` to the backend, and never hardcode `localhost:8010`.

## Use the generated types

Response types come from the backend's OpenAPI schema, so they can't drift:

- Import them from `src/lib/api-types.ts` (`AssignmentOut`, `SubmissionOut`, `CourseOut`, `UserOut` ...), for example `apiFetch<AssignmentOut>(...)`. Never write your own interface for a backend response.
- `src/lib/api-schema.ts` is generated: never edit it. For a schema the app doesn't use yet, add a line to `api-types.ts`: `export type EnrollmentOut = Schemas["EnrollmentOut"];`.
- After a backend schema change: start the backend, run `npm run api-types:pull`, then `npm run api-types`, and commit `openapi.json` with `api-schema.ts`. Fix whatever `npm run typecheck` then reports.
- A shape the backend hasn't built yet (a proposal, as in `features/submissions-review/types.ts`) stays a hand-written type in its feature folder until the endpoint exists.

## Show friendly messages

```tsx
try {
  await apiFetch(...);
} catch (error) {
  if (error instanceof ApiError) {
    setMessage(error.message);
  }
}
```

| Status | What it means | What the user sees |
|---|---|---|
| 401 | Not signed in, or the session expired. | "Your session has expired. Please sign in again." Then go to `ROUTES.LOGIN`. |
| 403 | The step is locked (for example, chat before the attempt is saved, or during the interview) or the role is wrong. | The backend's message, such as "Save your attempt first". |
| 429 | Rate limited. | "Too many requests. Please wait a moment and try again." Don't retry automatically in a loop. |
| 0 or 5xx | The backend is down. | "Can't reach the server…" or a generic error. Include `requestId` if you show details. |

## Never talk to Supabase from the frontend

- No `@supabase/*` packages, no Supabase keys, and no direct table queries. All auth and data go through the backend.
- Login, signup, logout and refresh are backend endpoints (`/auth/*`, backend issue #4).
- The session lives in **httpOnly cookies** the frontend never reads. Don't put tokens in `localStorage`, state or headers.

## Never put keys in code

The only frontend setting is `NEXT_PUBLIC_API_URL`. Anything with `NEXT_PUBLIC_` ships to every browser, so a secret must never get that prefix. Secrets live in the backend `.env` only.
