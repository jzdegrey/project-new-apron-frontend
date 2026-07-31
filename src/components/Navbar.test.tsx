/** @jest-environment jsdom */

import { render, screen } from "@testing-library/react";
import { Navbar } from "./Navbar";
import { ToastProvider } from "./Toast";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
}));

describe("Navbar", () => {
  it("renders a Home link and a Sign In / Create Account link when signed out", () => {
    render(<Navbar />);

    const homeLink = screen.getByRole("link", { name: "Home" });
    expect(homeLink).toHaveAttribute("href", "/");

    const authLink = screen.getByRole("link", { name: "Sign In / Create Account" });
    expect(authLink).toHaveAttribute("href", "/sign-in");
    expect(screen.queryByRole("button", { name: "Sign Out" })).not.toBeInTheDocument();
  });

  it("renders a Sign Out button instead of the auth link when signed in", () => {
    render(
      <ToastProvider>
        <Navbar isSignedIn />
      </ToastProvider>
    );

    expect(screen.getByRole("button", { name: "Sign Out" })).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Sign In / Create Account" })
    ).not.toBeInTheDocument();
  });

  it("points Home at the dashboard and shows portal links when signed in", () => {
    render(
      <ToastProvider>
        <Navbar isSignedIn />
      </ToastProvider>
    );

    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/dashboard");
    expect(screen.getByRole("link", { name: "Meal Plans" })).toHaveAttribute(
      "href",
      "/meal-plans"
    );
    expect(screen.getByRole("link", { name: "Recipes" })).toHaveAttribute("href", "/recipes");
  });

  it("does not show portal links when signed out", () => {
    render(<Navbar />);

    expect(screen.queryByRole("link", { name: "Meal Plans" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Recipes" })).not.toBeInTheDocument();
  });
});
