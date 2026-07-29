/** @jest-environment jsdom */

import { render, screen } from "@testing-library/react";
import { Footer } from "./Footer";

it("shows the current year in the copyright line", () => {
  render(<Footer />);

  const year = new Date().getFullYear().toString();
  expect(screen.getByText(new RegExp(`© ${year}`))).toBeInTheDocument();
});

it("links to the terms and privacy pages", () => {
  render(<Footer />);

  expect(screen.getByRole("link", { name: "Terms of Service" })).toHaveAttribute("href", "/terms");
  expect(screen.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute("href", "/privacy");
});
