/** @jest-environment jsdom */

import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("Home (public front page)", () => {
  it("renders the navbar, hero pitch, and a sign-in/create-account call to action", () => {
    render(<Home />);

    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Plan meals\. Save recipes\./ })
    ).toBeInTheDocument();

    const ctas = screen.getAllByRole("link", { name: "Sign In / Create Account" });
    expect(ctas.length).toBeGreaterThan(0);
    ctas.forEach((cta) => expect(cta).toHaveAttribute("href", "/sign-in"));
  });

  it("renders the footer", () => {
    render(<Home />);
    const year = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`© ${year}`))).toBeInTheDocument();
  });
});
