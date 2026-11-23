import Link from "next/link";

import { ROUTES } from "@/lib/constants";

/** The product mark and name, linking home. Takes its text color from the parent. */
export function ProductMark() {
  return (
    <Link
      href={ROUTES.HOME}
      className="flex items-center gap-2 rounded-md text-headline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
    >
      {/* Two stacked pages, in Northeastern red: the one place the brand color appears outside the landing page. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-6 text-brand"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 3h7l4 4v11a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
        <path d="M15 3v4h4" />
        <path d="M4 7v13a1 1 0 0 0 1 1h10" />
        <path d="M10 11h5M10 14.5h5" />
      </svg>
      AI-Native Assignments
    </Link>
  );
}
