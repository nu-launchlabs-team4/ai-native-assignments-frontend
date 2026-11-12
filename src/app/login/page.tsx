import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/PagePlaceholder";

export const metadata: Metadata = { title: "Log in" };

const INPUT_CLASS =
  "rounded-md border border-zinc-300 px-3 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:bg-zinc-100 dark:border-zinc-700 dark:disabled:bg-zinc-900";

// TODO(akashshetty1997): wire this form to the backend /auth endpoints (#3).
export default function LoginPage() {
  return (
    <PagePlaceholder title="Log in" description="Sign-in through the backend arrives in issue #3.">
      <form className="flex flex-col gap-4" aria-describedby="login-note">
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input id="email" name="email" type="email" autoComplete="email" disabled className={INPUT_CLASS} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            disabled
            className={INPUT_CLASS}
          />
        </div>
        <button
          type="submit"
          disabled
          className="self-start rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          Log in
        </button>
        <p id="login-note" className="text-sm text-zinc-600 dark:text-zinc-400">
          This form is disabled until login is built.
        </p>
      </form>
    </PagePlaceholder>
  );
}
