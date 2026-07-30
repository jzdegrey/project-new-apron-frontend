import { NextRequest } from "next/server";
import { POST } from "./route";
import { BackendApiError, backendLogin } from "@/lib/backendClient";
import { SESSION_COOKIE_NAME } from "@/lib/session";

jest.mock("../../../../lib/backendClient", () => ({
  ...jest.requireActual("../../../../lib/backendClient"),
  backendLogin: jest.fn(),
}));

function makeRequest(username: string, password: string) {
  return new NextRequest("http://localhost/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

beforeEach(() => {
  jest.resetAllMocks();
});

describe("POST /api/auth/login", () => {
  it("sets the session cookie on successful login", async () => {
    (backendLogin as jest.Mock).mockResolvedValue({
      access_token: "tok123",
      token_type: "bearer",
    });

    const response = await POST(makeRequest("janedoe1", "sup3rSecret!"));

    expect(backendLogin).toHaveBeenCalledWith("janedoe1", "sup3rSecret!");
    expect(response.status).toBe(200);
    expect(response.cookies.get(SESSION_COOKIE_NAME)?.value).toBe("tok123");
  });

  it("passes through the backend's error status and message without setting a cookie", async () => {
    (backendLogin as jest.Mock).mockRejectedValue(
      new BackendApiError(401, "Incorrect username or password.")
    );

    const response = await POST(makeRequest("janedoe1", "wrong-password"));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.message).toBe("Incorrect username or password.");
    expect(response.cookies.get(SESSION_COOKIE_NAME)).toBeUndefined();
  });

  it("returns a friendly generic message for an unexpected error", async () => {
    (backendLogin as jest.Mock).mockRejectedValue(new Error("connection refused"));

    const response = await POST(makeRequest("janedoe1", "sup3rSecret!"));
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body.message).toBe("Something went wrong on our end. Please try again in a moment.");
  });
});
