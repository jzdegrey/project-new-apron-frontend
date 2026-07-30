import { POST } from "./route";
import { SESSION_COOKIE_NAME } from "@/lib/session";

describe("POST /api/auth/logout", () => {
  it("clears the session cookie", async () => {
    const response = await POST();
    const body = await response.json();

    expect(body).toEqual({ ok: true });
    const cookie = response.cookies.get(SESSION_COOKIE_NAME);
    expect(cookie === undefined || cookie.value === "").toBe(true);
  });
});
