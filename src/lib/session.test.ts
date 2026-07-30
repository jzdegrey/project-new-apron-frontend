import { NextResponse } from "next/server";

/** `globals.appEnv` is resolved at import time, so each test loads the module
 * fresh (via `jest.isolateModules`) after setting `APP_ENV`, to exercise both
 * the local (non-secure cookie) and deployed (secure cookie) code paths. */
function loadSessionModule(appEnv: string) {
  let mod!: typeof import("./session");
  jest.isolateModules(() => {
    process.env.APP_ENV = appEnv;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    mod = require("./session");
  });
  return mod;
}

const ORIGINAL_APP_ENV = process.env.APP_ENV;

afterEach(() => {
  process.env.APP_ENV = ORIGINAL_APP_ENV;
});

describe("setSessionCookie", () => {
  it("sets an httpOnly, sameSite=lax cookie with the access token", () => {
    const { setSessionCookie, SESSION_COOKIE_NAME } = loadSessionModule("local");
    const response = NextResponse.json({ ok: true });

    setSessionCookie(response, "tok123");

    const cookie = response.cookies.get(SESSION_COOKIE_NAME);
    expect(cookie?.value).toBe("tok123");
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe("lax");
    expect(cookie?.path).toBe("/");
  });

  it("marks the cookie secure outside of local", () => {
    const { setSessionCookie, SESSION_COOKIE_NAME } = loadSessionModule("prod");
    const response = NextResponse.json({ ok: true });

    setSessionCookie(response, "tok123");

    expect(response.cookies.get(SESSION_COOKIE_NAME)?.secure).toBe(true);
  });

  it("does not mark the cookie secure in local (so it works over plain http)", () => {
    const { setSessionCookie, SESSION_COOKIE_NAME } = loadSessionModule("local");
    const response = NextResponse.json({ ok: true });

    setSessionCookie(response, "tok123");

    expect(response.cookies.get(SESSION_COOKIE_NAME)?.secure).toBeFalsy();
  });
});

describe("clearSessionCookie", () => {
  it("removes the session cookie", () => {
    const { setSessionCookie, clearSessionCookie, SESSION_COOKIE_NAME } = loadSessionModule(
      "local"
    );
    const response = NextResponse.json({ ok: true });
    setSessionCookie(response, "tok123");

    clearSessionCookie(response);

    const cookie = response.cookies.get(SESSION_COOKIE_NAME);
    expect(cookie === undefined || cookie.value === "").toBe(true);
  });
});
