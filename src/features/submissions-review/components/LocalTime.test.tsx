import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LocalTime } from "./LocalTime";

const ISO = "2026-11-20T18:30:00Z";

function inZone(timeZone: string) {
  const real = Intl.DateTimeFormat.prototype.resolvedOptions;
  vi.spyOn(Intl.DateTimeFormat.prototype, "resolvedOptions").mockImplementation(function (this: Intl.DateTimeFormat) {
    return { ...real.call(this), timeZone };
  });
}

describe("LocalTime", () => {
  afterEach(() => vi.restoreAllMocks());

  it("shows the time in the professor's own zone, with the zone", () => {
    inZone("America/New_York");
    render(<LocalTime iso={ISO} />);

    const time = screen.getByText("Nov 20, 2026, 1:30 PM EST");
    expect(time.tagName).toBe("TIME");
    expect(time.getAttribute("datetime")).toBe(ISO);
  });

  it("can show only the time of day", () => {
    inZone("America/Los_Angeles");
    render(<LocalTime iso={ISO} show="time" />);

    expect(screen.getByText("10:30 AM PST")).toBeDefined();
  });

  it("renders UTC on the server, which can't know the zone", () => {
    inZone("America/New_York");

    expect(renderToString(<LocalTime iso={ISO} />)).toContain("Nov 20, 2026, 6:30 PM UTC");
  });
});
