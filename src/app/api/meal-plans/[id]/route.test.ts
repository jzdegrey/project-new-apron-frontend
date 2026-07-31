import { NextRequest } from "next/server";
import { DELETE, GET, PUT } from "./route";
import {
  BackendApiError,
  backendDeleteMealPlan,
  backendGetMealPlan,
  backendUpdateMealPlan,
} from "@/lib/backendClient";
import { getSessionToken } from "@/lib/session";

jest.mock("../../../../lib/backendClient", () => ({
  ...jest.requireActual("../../../../lib/backendClient"),
  backendGetMealPlan: jest.fn(),
  backendUpdateMealPlan: jest.fn(),
  backendDeleteMealPlan: jest.fn(),
}));

jest.mock("../../../../lib/session", () => ({
  ...jest.requireActual("../../../../lib/session"),
  getSessionToken: jest.fn(),
}));

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  jest.resetAllMocks();
});

describe("GET /api/meal-plans/[id]", () => {
  it("requires authentication", async () => {
    (getSessionToken as jest.Mock).mockResolvedValue(undefined);

    const response = await GET(new NextRequest("http://localhost/api/meal-plans/1"), makeParams("1"));

    expect(response.status).toBe(401);
  });

  it("returns 404 for a non-numeric id without calling the backend", async () => {
    (getSessionToken as jest.Mock).mockResolvedValue("tok123");

    const response = await GET(
      new NextRequest("http://localhost/api/meal-plans/abc"),
      makeParams("abc")
    );

    expect(response.status).toBe(404);
    expect(backendGetMealPlan).not.toHaveBeenCalled();
  });

  it("returns 404 when the backend reports the plan doesn't exist", async () => {
    (getSessionToken as jest.Mock).mockResolvedValue("tok123");
    (backendGetMealPlan as jest.Mock).mockResolvedValue(null);

    const response = await GET(new NextRequest("http://localhost/api/meal-plans/1"), makeParams("1"));

    expect(response.status).toBe(404);
  });

  it("returns the meal plan on success", async () => {
    (getSessionToken as jest.Mock).mockResolvedValue("tok123");
    (backendGetMealPlan as jest.Mock).mockResolvedValue({ id: 1, name: "Week One" });

    const response = await GET(new NextRequest("http://localhost/api/meal-plans/1"), makeParams("1"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ id: 1, name: "Week One" });
  });
});

describe("PUT /api/meal-plans/[id]", () => {
  it("forwards the update to the backend", async () => {
    (getSessionToken as jest.Mock).mockResolvedValue("tok123");
    (backendUpdateMealPlan as jest.Mock).mockResolvedValue({ id: 1, name: "Renamed" });

    const request = new NextRequest("http://localhost/api/meal-plans/1", {
      method: "PUT",
      body: JSON.stringify({ name: "Renamed", start_date: "2026-01-01", end_date: "2026-01-07" }),
    });
    const response = await PUT(request, makeParams("1"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.name).toBe("Renamed");
  });

  it("surfaces a 422 with the range-shrink error message", async () => {
    (getSessionToken as jest.Mock).mockResolvedValue("tok123");
    (backendUpdateMealPlan as jest.Mock).mockRejectedValue(
      new BackendApiError(422, "The new date range must still include every existing meal's day.")
    );

    const request = new NextRequest("http://localhost/api/meal-plans/1", {
      method: "PUT",
      body: JSON.stringify({ start_date: "2026-01-01", end_date: "2026-01-02" }),
    });
    const response = await PUT(request, makeParams("1"));

    expect(response.status).toBe(422);
  });
});

describe("DELETE /api/meal-plans/[id]", () => {
  it("returns 204 on success", async () => {
    (getSessionToken as jest.Mock).mockResolvedValue("tok123");
    (backendDeleteMealPlan as jest.Mock).mockResolvedValue(undefined);

    const response = await DELETE(
      new NextRequest("http://localhost/api/meal-plans/1", { method: "DELETE" }),
      makeParams("1")
    );

    expect(response.status).toBe(204);
  });
});
