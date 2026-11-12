function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing ${name}. Copy .env.example to .env.local and fill it in.`);
  }
  return value;
}

// Read with a literal process.env.NAME so Next.js can inline it into the browser bundle.
export const env = {
  /** Backend base URL. The browser reaches it through the /api rewrite, not directly. */
  apiUrl: required("NEXT_PUBLIC_API_URL", process.env.NEXT_PUBLIC_API_URL),
} as const;
