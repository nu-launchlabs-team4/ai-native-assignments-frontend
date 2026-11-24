import { IBM_Plex_Mono, IBM_Plex_Sans, IBM_Plex_Serif } from "next/font/google";

// The IBM Plex family: Sans for text, Serif for titles, Mono for code.
// next/font downloads them at build time and serves them from this app, so pages
// make no requests to Google and text doesn't jump when the font arrives.

export const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-sans",
});

export const plexSerif = IBM_Plex_Serif({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-plex-serif",
});

export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
});

/** All three font variables, for the <html> element. */
export const fontVariables = `${plexSans.variable} ${plexSerif.variable} ${plexMono.variable}`;
