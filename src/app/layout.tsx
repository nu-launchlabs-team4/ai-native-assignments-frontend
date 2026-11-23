import type { Metadata } from "next";
import "./globals.css";

import { THEME_INIT_SCRIPT } from "@/lib/theme-init";

export const metadata: Metadata = {
  title: {
    default: "AI-Native Assignments",
    template: "%s · AI-Native Assignments",
  },
  description:
    "Programming assignments where students show their own reasoning, with an AI tutor that helps without giving answers.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The theme script may add the "dark" class before React loads, so the class can differ from the server render.
    <html lang="en" suppressHydrationWarning className="h-full antialiased">
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
