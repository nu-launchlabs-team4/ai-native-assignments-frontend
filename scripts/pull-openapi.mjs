// Refreshes openapi.json from a running backend: `npm run api-types:pull`, then `npm run api-types`.
// Keys are sorted so the checked-in file only changes where the backend's schema does.
import { writeFileSync } from "node:fs";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8010";

function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortKeys(value[key])]));
  }
  return value;
}

const response = await fetch(`${apiUrl}/openapi.json`);
if (!response.ok) {
  console.error(`Couldn't read ${apiUrl}/openapi.json (${response.status}). Is the backend running?`);
  process.exit(1);
}
writeFileSync("openapi.json", `${JSON.stringify(sortKeys(await response.json()), null, 2)}\n`);
console.log(`Saved openapi.json from ${apiUrl}. Now run: npm run api-types`);
