/** @jest-environment jsdom */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignOutButton } from "./SignOutButton";
import { ToastProvider } from "./Toast";

const pushMock = jest.fn();
const refreshMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
}));

function renderSignOutButton() {
  return render(
    <ToastProvider>
      <SignOutButton />
    </ToastProvider>
  );
}

beforeEach(() => {
  pushMock.mockReset();
  refreshMock.mockReset();
  global.fetch = jest.fn();
});

describe("SignOutButton", () => {
  it("calls the logout endpoint and navigates home on click", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true });
    renderSignOutButton();

    await userEvent.click(screen.getByRole("button", { name: "Sign Out" }));

    expect(global.fetch).toHaveBeenCalledWith("/api/auth/logout", { method: "POST" });
    expect(pushMock).toHaveBeenCalledWith("/");
    expect(refreshMock).toHaveBeenCalled();
  });

  it("shows a toast if the request fails", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("network error"));
    renderSignOutButton();

    await userEvent.click(screen.getByRole("button", { name: "Sign Out" }));

    expect(
      await screen.findByText("Unable to sign out. Please check your connection and try again.")
    ).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
