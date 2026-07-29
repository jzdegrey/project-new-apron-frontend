/** @jest-environment jsdom */

import { render, screen } from "@testing-library/react";
import { Navbar } from "./Navbar";

it("links Home to / and the auth CTA to /sign-in", () => {
  render(<Navbar />);

  expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
  expect(screen.getByRole("link", { name: "Sign In / Create Account" })).toHaveAttribute(
    "href",
    "/sign-in"
  );
});
