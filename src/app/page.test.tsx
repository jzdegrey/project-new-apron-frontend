/** @jest-environment jsdom */

import { render, screen, within } from "@testing-library/react";
import Home from "./page";
import { ToastProvider } from "@/components/Toast";
import { backendGetCurrentUser } from "@/lib/backendClient";
import { getSessionToken } from "@/lib/session";

jest.mock("../lib/backendClient", () => ({
  ...jest.requireActual("../lib/backendClient"),
  backendGetCurrentUser: jest.fn(),
}));

jest.mock("../lib/session", () => ({
  ...jest.requireActual("../lib/session"),
  getSessionToken: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
}));

async function renderHome() {
  const ui = await Home();
  return render(<ToastProvider>{ui}</ToastProvider>);
}

beforeEach(() => {
  jest.resetAllMocks();
});

describe("Home (public front page)", () => {
  it("renders the navbar, hero pitch, and a sign-in/create-account call to action when signed out", async () => {
    (getSessionToken as jest.Mock).mockResolvedValue(undefined);

    await renderHome();

    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Plan meals\. Save recipes\./ })
    ).toBeInTheDocument();

    const ctas = screen.getAllByRole("link", { name: "Sign In / Create Account" });
    expect(ctas.length).toBeGreaterThan(0);
    ctas.forEach((cta) => expect(cta).toHaveAttribute("href", "/sign-in"));
    expect(screen.queryByRole("button", { name: "Sign Out" })).not.toBeInTheDocument();
  });

  it("renders a Sign Out button in the navbar when already signed in", async () => {
    (getSessionToken as jest.Mock).mockResolvedValue("tok123");
    (backendGetCurrentUser as jest.Mock).mockResolvedValue({ id: 1, first_name: "Ada" });

    await renderHome();

    const nav = screen.getByRole("navigation");
    expect(screen.getByRole("button", { name: "Sign Out" })).toBeInTheDocument();
    expect(
      within(nav).queryByRole("link", { name: "Sign In / Create Account" })
    ).not.toBeInTheDocument();
  });

  it("renders the footer", async () => {
    (getSessionToken as jest.Mock).mockResolvedValue(undefined);

    await renderHome();
    const year = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`© ${year}`))).toBeInTheDocument();
  });
});
