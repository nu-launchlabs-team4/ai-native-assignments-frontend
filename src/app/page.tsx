import Link from "next/link";

import { ROUTES } from "@/lib/constants";

const ENTRY_LINKS = [
  { href: ROUTES.LOGIN, label: "Log in", description: "Sign in as a student or professor." },
  { href: ROUTES.STUDENT, label: "Student", description: "Work through an assignment in five steps." },
  { href: ROUTES.PROFESSOR, label: "Professor", description: "Set up assignments and review submissions." },
] as const;

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-3">
        <h1 className="text-4xl font-semibold tracking-tight">AI-Native Assignments</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Students attempt, get feedback, evaluate, revise and explain their work, with an AI tutor that
          helps without giving away the answer.
        </p>
      </header>

      <nav aria-label="Main">
        <ul className="flex flex-col gap-3">
          {ENTRY_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="flex flex-col rounded-lg border border-zinc-200 px-5 py-4 hover:border-zinc-400 focus-visible:outline-2 focus-visible:outline-offset-2 dark:border-zinc-800 dark:hover:border-zinc-600"
              >
                <span className="font-medium">{link.label}</span>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">{link.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <footer>
        <Link
          href={ROUTES.STATUS}
          className="text-sm text-zinc-600 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 dark:text-zinc-400"
        >
          System status
        </Link>
      </footer>
    </main>
  );
}
