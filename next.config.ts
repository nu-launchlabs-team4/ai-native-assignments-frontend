import type { NextConfig } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
if (!apiUrl) {
  throw new Error("Missing NEXT_PUBLIC_API_URL. Copy .env.example to .env.local.");
}

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    // The browser calls /api/* on this origin, and Next.js forwards it to the backend.
    // Auth cookies the backend sets are then first-party to the frontend.
    return [{ source: "/api/:path*", destination: `${apiUrl.replace(/\/$/, "")}/:path*` }];
  },
};

export default nextConfig;
