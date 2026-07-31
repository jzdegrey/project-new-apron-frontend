import { NextRequest } from "next/server";
import { POST } from "./route";
import { BackendApiError, backendCreateMeal } from "@/lib/backendClient";
import { getSessionToken } from "@/lib/session";

jest.mock("../../../../../lib/backendClient", () => ({
  ...jest.requireActual("../../../../../lib/backendClient"),
  backendCreateMeal: jest.fn(),
}));

jest.mock("../../../../../lib/session", () => ({
  ...jest.requireActual("../../../../../lib/session"),
  getSessionToken: jest.fn(),
}));

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  jest.resetAllMocks();
});

describe("POST /api/meal-plans/[id]/meals", () => {
  it("requires authentication", async () => {
    (getSessionToken as jest.Mock).mockResolvedValue(undefined);

    const request = new NextRequest("http://localhost/api/meal-plans/1/meals", {
      method: "POST",
      body: JSON.stringify({ meal_type: "breakfast", day: "2026-01-02" }),
    });
    const response = await POST(request, makeParams("1"));

    expect(response.status).toBe(401);
    expect(backendCreateMeal).not.toHaveBeenCalled();
  });

  it("creates the meal and returns 201", async () => {
    (getSessionToken as jest.Mock).mockResolvedValue("tok123");
    (backendCreateMeal as jest.Mock).mockResolvedValue({ id: 5, meal_type: "breakfast", day: "2026-01-02", recipes: [] });

    const request = new NextRequest("http://localhost/api/meal-plans/1/meals", {
      method: "POST",
      body: JSON.stringify({ meal_type: "breakfast", day: "2026-01-02" }),
    });
    const response = await POST(request, makeParams("1"));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.id).toBe(5);
    expect(backendCreateMeal).toHaveBeenCalledWith("tok123", 1, { meal_type: "breakfast", day: "2026-01-02" });
  });

  it("surfaces a 409 when the meal type/day combination already exists", async () => {
    (getSessionToken as jest.Mock).mockResolvedValue("tok123");
    (backendCreateMeal as jest.Mock).mockRejectedValue(
      new BackendApiError(409, "A breakfast meal already exists for this day.")
    );

    const request = new NextRequest("http://localhost/api/meal-plans/1/meals", {
      method: "POST",
      body: JSON.stringify({ meal_type: "breakfast", day: "2026-01-02" }),
    });
    const response = await POST(request, makeParams("1"));

    expect(response.status).toBe(409);
  });
});
