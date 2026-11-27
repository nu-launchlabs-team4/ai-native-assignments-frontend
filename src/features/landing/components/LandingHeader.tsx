import Link from "next/link";

import { AppearanceControl } from "@/components/AppearanceControl";
import { ProductMark } from "@/components/ProductMark";
import { ROUTES } from "@/lib/constants";

import { CONTAINER_CLASS, FOCUS_CLASS } from "../styles";

/** Product name on the left; appearance and Log in on the right. Wraps on narrow screens. */
export function LandingHeader() {
  return (
    <header className="border-b border-line">
      <div className={`${CONTAINER_CLASS} flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-4`}>
        <div className="text-foreground">
          <ProductMark />
        </div>
        <div className="flex items-center gap-3">
          <AppearanceControl />
          <Link
            href={ROUTES.LOGIN}
            className={
              "inline-flex h-9 items-center rounded-lg border border-foreground px-4 text-callout font-semibold text-foreground transition-transform " +
              "hover:border-brand hover:bg-brand hover:text-brand-foreground active:scale-[0.97] " +
              "motion-reduce:transition-none motion-reduce:active:scale-100 pointer-coarse:min-h-11 " +
              FOCUS_CLASS
            }
          >
            Log in
          </Link>
        </div>
      </div>
    </header>
  );
}
