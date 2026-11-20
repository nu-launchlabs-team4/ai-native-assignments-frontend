import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { THEME_INIT_SCRIPT } from "@/lib/theme-init";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
