import type { NextResponse } from "next/server";
import { globals } from "@/config/globals";

export const SESSION_COOKIE_NAME = "session";

/** Match the backend's access token lifetime (see ACCESS_TOKEN_EXPIRE_MINUTES). */
const SESSION_MAX_AGE_SECONDS = 60 * 60;

export function setSessionCookie(response: NextResponse, accessToken: string): void {
  response.cookies.set(SESSION_COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure: globals.appEnv !== "local",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.delete(SESSION_COOKIE_NAME);
}
