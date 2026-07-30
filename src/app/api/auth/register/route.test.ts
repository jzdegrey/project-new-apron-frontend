import { NextRequest } from "next/server";
import { POST } from "./route";
import { BackendApiError, backendLogin, backendRegister } from "@/lib/backendClient";
import { SESSION_COOKIE_NAME } from "@/lib/session";

jest.mock("../../../../lib/backendClient", () => ({
  ...jest.requireActual("../../../../lib/backendClient"),
  backendRegister: jest.fn(),
  backendLogin: jest.fn(),
}));

const REGISTER_PAYLOAD = {
  username: "janedoe1",
  password: "sup3rSecret!",
  confirm_password: "sup3rSecret!",
  first_name: "Jane",
  last_name: "Doe",
  date_of_birth: "2000-01-01",
  agreed_to_terms: true,
  email_subscription_opt_in: true,
};

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  jest.resetAllMocks();
});

describe("POST /api/auth/register", () => {
  it("registers, then automatically signs the user in and sets the session cookie", async () => {
    (backendRegister as jest.Mock).mockResolvedValue({ id: 1, username: "janedoe1" });
    (backendLogin as jest.Mock).mockResolvedValue({
      access_token: "tok123",
      token_type: "bearer",
    });

    const response = await POST(makeRequest(REGISTER_PAYLOAD));

    expect(backendRegister).toHaveBeenCalledWith(REGISTER_PAYLOAD);
    expect(backendLogin).toHaveBeenCalledWith("janedoe1", "sup3rSecret!");
    expect(response.status).toBe(200);
    expect(response.cookies.get(SESSION_COOKIE_NAME)?.value).toBe("tok123");
  });

  it("returns field errors and status from a validation failure without signing in", async () => {
    (backendRegister as jest.Mock).mockRejectedValue(
      new BackendApiError(422, "Please fix the highlighted fields.", {
        username: "Username is already taken.",
      })
    );

    const response = await POST(makeRequest(REGISTER_PAYLOAD));
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.fieldErrors).toEqual({ username: "Username is already taken." });
    expect(backendLogin).not.toHaveBeenCalled();
    expect(response.cookies.get(SESSION_COOKIE_NAME)).toBeUndefined();
  });

  it("returns a friendly generic message for an unexpected error", async () => {
    (backendRegister as jest.Mock).mockRejectedValue(new Error("connection refused"));

    const response = await POST(makeRequest(REGISTER_PAYLOAD));
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body.message).toBe("Something went wrong on our end. Please try again in a moment.");
  });
});
