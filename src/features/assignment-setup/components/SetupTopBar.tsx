import Link from "next/link";

import { AppearanceControl } from "@/components/AppearanceControl";
import { ROUTES } from "@/lib/constants";

/** The back link to the dashboard and the appearance control, above every setup screen. */
export function SetupTopBar() {
  return (
    <div className="flex items-center justify-between">
      <Link
        href={ROUTES.PROFESSOR}
        className="text-sm text-muted underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        ← Professor dashboard
      </Link>
      <AppearanceControl />
    </div>
  );
}
