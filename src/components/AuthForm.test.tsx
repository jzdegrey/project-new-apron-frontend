/** @jest-environment jsdom */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthForm } from "./AuthForm";
import { ToastProvider } from "./Toast";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

function renderAuthForm() {
  return render(
    <ToastProvider>
      <AuthForm />
    </ToastProvider>
  );
}

beforeEach(() => {
  pushMock.mockReset();
  global.fetch = jest.fn();
});

describe("AuthForm - sign in mode", () => {
  it("renders sign-in fields by default", () => {
    renderAuthForm();
    expect(screen.getByRole("heading", { name: "Sign In" })).toBeInTheDocument();
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.queryByLabelText("Confirm Password")).not.toBeInTheDocument();
  });

  it("blocks submission and shows errors when fields are empty", async () => {
    const user = userEvent.setup();
    renderAuthForm();

    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(await screen.findByText("Username is required.")).toBeInTheDocument();
    expect(screen.getByText("Password is required.")).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("submits credentials and redirects to /welcome on success", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });
    const user = userEvent.setup();
    renderAuthForm();

    await user.type(screen.getByLabelText("Username"), "janedoe1");
    await user.type(screen.getByLabelText("Password"), "sup3rSecret!");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/welcome"));
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/auth/login",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("shows a form-level error message on invalid credentials", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ message: "Incorrect username or password." }),
    });
    const user = userEvent.setup();
    renderAuthForm();

    await user.type(screen.getByLabelText("Username"), "janedoe1");
    await user.type(screen.getByLabelText("Password"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(await screen.findByText("Incorrect username or password.")).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("shows a toast for unexpected server errors", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => ({ message: "Something went wrong on our end. Please try again in a moment." }),
    });
    const user = userEvent.setup();
    renderAuthForm();

    await user.type(screen.getByLabelText("Username"), "janedoe1");
    await user.type(screen.getByLabelText("Password"), "sup3rSecret!");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(
      await screen.findByText("Something went wrong on our end. Please try again in a moment.")
    ).toBeInTheDocument();
  });

  it("toggles password visibility", async () => {
    const user = userEvent.setup();
    renderAuthForm();

    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
    expect(passwordInput.type).toBe("password");

    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(passwordInput.type).toBe("text");

    await user.click(screen.getByRole("button", { name: "Hide password" }));
    expect(passwordInput.type).toBe("password");
  });
});

describe("AuthForm - create account mode", () => {
  it("switches to create-account fields", async () => {
    const user = userEvent.setup();
    renderAuthForm();

    await user.click(screen.getByRole("button", { name: "Create Account" }));

    expect(screen.getByRole("heading", { name: "Create Account" })).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
    expect(screen.getByLabelText("First Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Last Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Date of Birth")).toBeInTheDocument();
  });

  it("shows live feedback when passwords do not match", async () => {
    const user = userEvent.setup();
    renderAuthForm();
    await user.click(screen.getByRole("button", { name: "Create Account" }));

    await user.type(screen.getByLabelText("Password"), "sup3rSecret!");
    await user.type(screen.getByLabelText("Confirm Password"), "different!");

    expect(await screen.findByText("Passwords do not match.")).toBeInTheDocument();
  });

  it("shows live positive feedback when passwords match", async () => {
    const user = userEvent.setup();
    renderAuthForm();
    await user.click(screen.getByRole("button", { name: "Create Account" }));

    await user.type(screen.getByLabelText("Password"), "sup3rSecret!");
    await user.type(screen.getByLabelText("Confirm Password"), "sup3rSecret!");

    expect(await screen.findByText("Passwords match.")).toBeInTheDocument();
  });

  it("blocks submission when terms are not agreed to", async () => {
    const user = userEvent.setup();
    renderAuthForm();
    await user.click(screen.getByRole("button", { name: "Create Account" }));

    await user.type(screen.getByLabelText("Username"), "janedoe1");
    await user.type(screen.getByLabelText("Password"), "sup3rSecret!");
    await user.type(screen.getByLabelText("Confirm Password"), "sup3rSecret!");
    await user.type(screen.getByLabelText("First Name"), "Jane");
    await user.type(screen.getByLabelText("Last Name"), "Doe");
    await user.type(screen.getByLabelText("Date of Birth"), "2000-01-01");
    await user.click(screen.getByRole("button", { name: "Create Account" }));

    expect(
      await screen.findByText("You must agree to the Terms of Service and Privacy Policy.")
    ).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("email subscription checkbox defaults to checked", async () => {
    const user = userEvent.setup();
    renderAuthForm();
    await user.click(screen.getByRole("button", { name: "Create Account" }));

    expect(screen.getByLabelText("Sign up for email updates")).toBeChecked();
  });
});
