import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// jsdom doesn't implement scrolling. The chat panel scrolls to its newest message,
// so every test that renders it unlocked needs this.
Element.prototype.scrollIntoView = vi.fn();

// Unmount rendered components between tests so queries only see the current test.
afterEach(() => {
  cleanup();
});
