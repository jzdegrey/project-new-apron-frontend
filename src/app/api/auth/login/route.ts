import { NextRequest, NextResponse } from "next/server";
import { BackendApiError, backendLogin } from "@/lib/backendClient";
import { logger } from "@/lib/logger";
import { setSessionCookie } from "@/lib/session";

export async function POST(request: NextRequest) {
  const { username, password } = (await request.json()) as {
    username: string;
    password: string;
  };

  try {
    const { access_token: accessToken } = await backendLogin(username, password);
    const response = NextResponse.json({ ok: true });
    setSessionCookie(response, accessToken);
    return response;
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    logger.error("Login failed unexpectedly", { error: String(error) });
    return NextResponse.json({ message: "Something went wrong on our end. Please try again in a moment." }, { status: 502 });
  }
}
