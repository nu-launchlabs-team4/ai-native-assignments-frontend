---
name: setup-project
description: Set up the AI-Native Assignments frontend on a new machine, or fix a broken local setup. Use when a teammate is cloning the repo for the first time, creating .env.local, running npm run dev or docker compose up, or when /status shows the API as unreachable, port 3000 is busy, or the app fails with "Missing NEXT_PUBLIC_API_URL".
---

# Set up the frontend

The frontend is a Next.js app on **http://localhost:3000**. It talks **only to our backend**, never to Supabase. The browser calls `/api/*` on the frontend, and Next.js forwards those calls to the backend (port **8010**).

## Steps

1. **Install Node 24** (see `.nvmrc`). With nvm, run `nvm install && nvm use`. For the Docker option, install Docker Desktop instead.
2. **Start the backend first.** Follow its `setup-project` skill. http://localhost:8010/health must show `"db": "connected"`.
3. **Clone the repo:**
   ```bash
   git clone https://github.com/nu-launchlabs-team4/ai-native-assignments-frontend.git
   cd ai-native-assignments-frontend
   ```
4. **Create `.env.local`:**
   ```bash
   cp .env.example .env.local
   ```
   It holds one value, `NEXT_PUBLIC_API_URL=http://localhost:8010`, which isn't secret. If Akash shares other values later, get them privately and never commit them. Never print `.env.local`.
5. **Run the app.** Pick one option.
   - **npm:**
     ```bash
     npm install
     npm run dev
     ```
   - **Docker:**
     ```bash
     docker compose up --build
     ```
     Compose points the `/api` rewrite at `host.docker.internal:8010`, because `localhost` inside the container is the container itself.
6. **Check `/status`:** open http://localhost:3000/status. Both **API** and **Database** should say **Connected**.
7. **Run the checks before pushing:**
   ```bash
   npm run lint
   npm run typecheck
   npm run build
   ```

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `Port 3000 is in use` or `port is already allocated` | Another app is using port 3000. | Find it with `lsof -nP -iTCP:3000 -sTCP:LISTEN`. Stop it, or run `npm run dev -- --port 3010`. The backend doesn't need to know the port, because calls go through the same-origin `/api` rewrite. |
| `Missing NEXT_PUBLIC_API_URL` | There's no `.env.local`, or the value is empty. | Run `cp .env.example .env.local`, then restart the dev server. Next reads env files only at startup. |
| `/status` shows **API: Unreachable** | The backend isn't running on 8010, or `NEXT_PUBLIC_API_URL` points somewhere else. | Open http://localhost:8010/health directly. If that fails, start the backend with `docker compose up -d` in the backend folder. In Docker, the frontend container must reach `host.docker.internal:8010`. |
| A CORS error in the browser console | Something is calling the backend directly at `localhost:8010` instead of `/api/...`. | Every call must go through `apiFetch` in `src/lib/api.ts`, which uses `/api`. Same-origin calls never need CORS. |
| `/status` shows **Database: Unreachable** | The backend is up but can't reach Supabase. Usually the Supabase project is paused after about a week with no activity. | Ask Akash to restore the project in the Supabase dashboard, or follow the backend's `setup-project` troubleshooting. |
| `Cannot find name 'LayoutProps'` from `tsc` | The route types haven't been generated yet. | Run `npm run typecheck`, which runs `next typegen` first, instead of plain `tsc`. |
