import {
  backendGetCurrentUser,
  backendLogin,
  backendRegister,
  BackendApiError,
  type RegisterPayload,
} from "./backendClient";

const REGISTER_PAYLOAD: RegisterPayload = {
  username: "janedoe1",
  password: "sup3rSecret!",
  confirm_password: "sup3rSecret!",
  first_name: "Jane",
  last_name: "Doe",
  date_of_birth: "2000-01-01",
  agreed_to_terms: true,
  email_subscription_opt_in: true,
};

beforeEach(() => {
  global.fetch = jest.fn();
});

describe("backendRegister", () => {
  it("returns the created user on success", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1, username: "janedoe1" }),
    });

    const user = await backendRegister(REGISTER_PAYLOAD);
    expect(user).toEqual({ id: 1, username: "janedoe1" });
  });

  it("maps a 422 field-error response into a BackendApiError with fieldErrors", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({
        detail: [{ loc: ["body", "username"], msg: "Value error, Username is already taken." }],
      }),
    });

    await expect(backendRegister(REGISTER_PAYLOAD)).rejects.toMatchObject({
      status: 422,
      fieldErrors: { username: "Username is already taken." },
    });
  });

  it("maps a plain string detail into the error message", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({ detail: "Username is already taken." }),
    });

    await expect(backendRegister(REGISTER_PAYLOAD)).rejects.toMatchObject({
      status: 409,
      message: "Username is already taken.",
    });
  });

  it("falls back to a generic message when the error body isn't JSON", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error("not json");
      },
    });

    await expect(backendRegister(REGISTER_PAYLOAD)).rejects.toMatchObject({
      status: 500,
      message: "Something went wrong on our end. Please try again in a moment.",
    });
  });

  it("throws instances of BackendApiError", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({ detail: "Username is already taken." }),
    });

    await expect(backendRegister(REGISTER_PAYLOAD)).rejects.toBeInstanceOf(BackendApiError);
  });
});

describe("backendLogin", () => {
  it("posts form-encoded credentials and returns the token on success", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ access_token: "tok123", token_type: "bearer" }),
    });

    const result = await backendLogin("janedoe1", "sup3rSecret!");

    expect(result).toEqual({ access_token: "tok123", token_type: "bearer" });
    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(init.headers["Content-Type"]).toBe("application/x-www-form-urlencoded");
    expect(init.body.toString()).toBe("username=janedoe1&password=sup3rSecret%21");
  });

  it("throws a BackendApiError on invalid credentials", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ detail: "Incorrect username or password." }),
    });

    await expect(backendLogin("janedoe1", "wrong")).rejects.toMatchObject({
      status: 401,
      message: "Incorrect username or password.",
    });
  });
});

describe("backendGetCurrentUser", () => {
  it("returns the user for a valid token", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1, username: "janedoe1" }),
    });

    const user = await backendGetCurrentUser("valid-token");
    expect(user).toEqual({ id: 1, username: "janedoe1" });
  });

  it("returns null (rather than throwing) for an invalid/expired token", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ detail: "Not authenticated" }),
    });

    const user = await backendGetCurrentUser("bad-token");
    expect(user).toBeNull();
  });
});
