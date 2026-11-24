import Link from "next/link";
import type { ReactNode } from "react";

import { ProductMark } from "@/components/ProductMark";

interface AuthLayoutProps {
  title: string;
  /** One line under the title: what this screen is for. */
  description: ReactNode;
  children: ReactNode;
  /** A line under the card, such as the link to the other form. */
  footer: ReactNode;
}

/** A narrow, centered card for the log-in and sign-up forms, under the product mark. */
export function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-6 px-4 py-12 sm:py-20">
      <div className="text-foreground">
        <ProductMark />
      </div>
      <div className="flex flex-col gap-5 rounded-xl border border-line bg-surface p-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-large-title">{title}</h1>
          <p className="text-body text-muted">{description}</p>
        </div>
        {children}
      </div>
      <p className="text-center text-callout text-muted">{footer}</p>
    </main>
  );
}

/** A text link on the auth screens, such as in the footer line. 44 px tall on touch screens. */
export function AuthFooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus pointer-coarse:inline-flex pointer-coarse:min-h-11 pointer-coarse:items-center"
    >
      {children}
    </Link>
  );
}
