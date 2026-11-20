import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Resolves the @/* alias from tsconfig.json.
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    // Placeholder so lib/env.ts loads, as in CI. Tests mock every backend call.
    env: { NEXT_PUBLIC_API_URL: "http://localhost:8010" },
    setupFiles: ["./vitest.setup.ts"],
  },
});
