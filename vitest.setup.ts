import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Unmount rendered components between tests so queries only see the current test.
afterEach(() => {
  cleanup();
});
