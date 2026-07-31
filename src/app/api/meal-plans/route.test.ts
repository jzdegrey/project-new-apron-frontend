import { NextRequest } from "next/server";
import { GET, POST } from "./route";
import { BackendApiError, backendCreateMealPlan, backendListMealPlans } from "@/lib/backendClient";
import { getSessionToken } from "@/lib/session";

jest.mock("../../../lib/backendClient", () => ({
  ...jest.requireActual("../../../lib/backendClient"),
  backendListMealPlans: jest.fn(),
  backendCreateMealPlan: jest.fn(),
}));

jest.mock("../../../lib/session", () => ({
  ...jest.requireActual("../../../lib/session"),
  getSessionToken: jest.fn(),
}));

beforeEach(() => {
  jest.resetAllMocks();
});

describe("GET /api/meal-plans", () => {
  it("requires authentication", async () => {
    (getSessionToken as jest.Mock).mockResolvedValue(undefined);

    const response = await GET(new NextRequest("http://localhost/api/meal-plans"));

    expect(response.status).toBe(401);
    expect(backendListMealPlans).not.toHaveBeenCalled();
  });

  it("defaults offset/limit and forwards them to the backend", async () => {
    (getSessionToken as jest.Mock).mockResolvedValue("tok123");
    (backendListMealPlans as jest.Mock).mockResolvedValue({ items: [], page_size: 15, has_more: false });

    const response = await GET(new NextRequest("http://localhost/api/meal-plans"));

    expect(response.status).toBe(200);
    expect(backendListMealPlans).toHaveBeenCalledWith("tok123", { offset: 0, limit: 15 });
  });

  it("passes through explicit query params", async () => {
    (getSessionToken as jest.Mock).mockResolvedValue("tok123");
    (backendListMealPlans as jest.Mock).mockResolvedValue({ items: [], page_size: 15, has_more: true });

    await GET(new NextRequest("http://localhost/api/meal-plans?offset=15&limit=15"));

    expect(backendListMealPlans).toHaveBeenCalledWith("tok123", { offset: 15, limit: 15 });
  });

  it("passes through the backend's error status", async () => {
    (getSessionToken as jest.Mock).mockResolvedValue("tok123");
    (backendListMealPlans as jest.Mock).mockRejectedValue(new BackendApiError(502, "Bad gateway"));

    const response = await GET(new NextRequest("http://localhost/api/meal-plans"));

    expect(response.status).toBe(502);
  });
});

describe("POST /api/meal-plans", () => {
  function makeRequest(body: unknown) {
    return new NextRequest("http://localhost/api/meal-plans", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  it("requires authentication", async () => {
    (getSessionToken as jest.Mock).mockResolvedValue(undefined);

    const response = await POST(makeRequest({ start_date: "2026-01-01", end_date: "2026-01-07" }));

    expect(response.status).toBe(401);
    expect(backendCreateMealPlan).not.toHaveBeenCalled();
  });

  it("creates the meal plan and returns 201", async () => {
    (getSessionToken as jest.Mock).mockResolvedValue("tok123");
    (backendCreateMealPlan as jest.Mock).mockResolvedValue({ id: 1, name: "Week One" });

    const response = await POST(makeRequest({ start_date: "2026-01-01", end_date: "2026-01-07" }));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual({ id: 1, name: "Week One" });
  });

  it("returns field errors from a validation failure", async () => {
    (getSessionToken as jest.Mock).mockResolvedValue("tok123");
    (backendCreateMealPlan as jest.Mock).mockRejectedValue(
      new BackendApiError(422, "Please fix the highlighted fields.", {
        end_date: "End date must be on or after the start date.",
      })
    );

    const response = await POST(makeRequest({ start_date: "2026-01-10", end_date: "2026-01-01" }));
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.fieldErrors).toEqual({ end_date: "End date must be on or after the start date." });
  });
});
