/** @jest-environment jsdom */

import { render, screen } from "@testing-library/react";
import Home from "./page";

it("renders the navbar, hero pitch, CTA, and footer", () => {
  render(<Home />);

  expect(screen.getByRole("link", { name: "Sign In / Create Account" })).toHaveAttribute(
    "href",
    "/sign-in"
  );
  expect(
    screen.getByRole("heading", { name: "Plan meals. Save recipes. Eat better — together." })
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Get Started" })).toHaveAttribute("href", "/sign-in");
  expect(screen.getByText(/All rights reserved\./)).toBeInTheDocument();
});
