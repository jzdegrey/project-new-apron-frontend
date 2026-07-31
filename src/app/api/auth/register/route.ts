import { NextRequest, NextResponse } from "next/server";
import { BackendApiError, backendLogin, backendRegister, type RegisterPayload } from "@/lib/backendClient";
import { logger } from "@/lib/logger";
import { setSessionCookie } from "@/lib/session";

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as RegisterPayload;

  try {
    await backendRegister(payload);
    const { access_token: accessToken } = await backendLogin(payload.username, payload.password);

    const response = NextResponse.json({ ok: true });
    setSessionCookie(response, accessToken);
    return response;
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message, fieldErrors: error.fieldErrors },
        { status: error.status }
      );
    }
    logger.error("Registration failed unexpectedly", { error: String(error) });
    return NextResponse.json({ message: "Something went wrong on our end. Please try again in a moment." }, { status: 502 });
  }
}
