import Link from "next/link";

import { AppearanceControl } from "@/components/AppearanceControl";
import { SidebarMenuButton } from "@/features/app-shell/components/SidebarMenuButton";
import { ROUTES } from "@/lib/constants";

/** The sidebar menu, the back link to the dashboard and the appearance control, above every setup screen. */
export function SetupTopBar() {
  return (
    <div className="flex items-center justify-between gap-3">
      <SidebarMenuButton />
      <Link
        href={ROUTES.PROFESSOR}
        className="mr-auto text-callout text-muted underline-offset-4 hover:text-brand-text hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        ← Professor dashboard
      </Link>
      <AppearanceControl />
    </div>
  );
}
