import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ErrorMessage } from "./ErrorMessage";

describe("ErrorMessage", () => {
  it("shows the words with an icon that screen readers skip", () => {
    render(<ErrorMessage role="alert">Wrong email or password.</ErrorMessage>);

    const alert = screen.getByRole("alert");
    expect(alert.textContent).toBe("Wrong email or password.");
    expect(alert.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("can be the description of a field", () => {
    render(<ErrorMessage id="email-error">Enter an email address.</ErrorMessage>);

    expect(document.getElementById("email-error")?.textContent).toBe("Enter an email address.");
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
