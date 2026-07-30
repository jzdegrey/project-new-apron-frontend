/** @jest-environment jsdom */

import { render, screen } from "@testing-library/react";
import { Navbar } from "./Navbar";

describe("Navbar", () => {
  it("renders a Home link and a Sign In / Create Account link", () => {
    render(<Navbar />);

    const homeLink = screen.getByRole("link", { name: "Home" });
    expect(homeLink).toHaveAttribute("href", "/");

    const authLink = screen.getByRole("link", { name: "Sign In / Create Account" });
    expect(authLink).toHaveAttribute("href", "/sign-in");
  });
});
