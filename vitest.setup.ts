import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// jsdom doesn't implement scrolling. The chat panel scrolls to its newest message,
// so every test that renders it unlocked needs this.
Element.prototype.scrollIntoView = vi.fn();

// jsdom has no matchMedia. The appearance code asks whether the device is in dark mode;
// tests answer "light" unless they set window.__prefersDark.
declare global {
  interface Window {
    __prefersDark?: boolean;
  }
}
window.matchMedia = (query: string) =>
  ({
    matches: query.includes("dark") ? Boolean(window.__prefersDark) : false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }) as MediaQueryList;

// Unmount rendered components between tests so queries only see the current test.
afterEach(() => {
  cleanup();
});
