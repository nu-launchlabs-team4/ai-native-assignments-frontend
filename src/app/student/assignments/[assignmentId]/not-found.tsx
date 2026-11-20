import Link from "next/link";

import { ROUTES } from "@/lib/constants";

export default function AssignmentNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-6 py-16">
      <h1 className="text-2xl font-semibold">Assignment not found</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        This assignment doesn&apos;t exist, or you don&apos;t have access to it.
      </p>
      <Link
        href={ROUTES.STUDENT}
        className="self-start text-sm font-medium underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        Back to assignments
      </Link>
    </main>
  );
}
