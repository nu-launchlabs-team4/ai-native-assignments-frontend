import type { NavIcon } from "../nav-items";

const PATHS: Record<NavIcon, string> = {
  // A stack of pages.
  assignments: "M8 3h7l4 4v11a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM15 3v4h4M10 11h5M10 14.5h5",
  new: "M12 5v14M5 12h14",
};

/** A menu icon. Decorative: the item's label names it. */
export function NavIconGlyph({ icon }: { icon: NavIcon }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={PATHS[icon]} />
    </svg>
  );
}
