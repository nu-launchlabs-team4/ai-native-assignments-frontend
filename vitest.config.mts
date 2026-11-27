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
    // TZ: times render in the browser's zone (LocalTime), so tests pin one.
    env: { NEXT_PUBLIC_API_URL: "http://localhost:8010", TZ: "UTC" },
    setupFiles: ["./vitest.setup.ts"],
  },
});
