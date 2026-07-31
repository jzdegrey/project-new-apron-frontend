import { NextRequest } from "next/server";
import { GET, POST } from "./route";
import { BackendApiError, backendCreateRecipe, backendListRecipes } from "@/lib/backendClient";
import { getSessionToken } from "@/lib/session";

jest.mock("../../../lib/backendClient", () => ({
  ...jest.requireActual("../../../lib/backendClient"),
  backendListRecipes: jest.fn(),
  backendCreateRecipe: jest.fn(),
}));

jest.mock("../../../lib/session", () => ({
  ...jest.requireActual("../../../lib/session"),
  getSessionToken: jest.fn(),
}));

beforeEach(() => {
  jest.resetAllMocks();
});

describe("GET /api/recipes", () => {
  it("requires authentication", async () => {
    (getSessionToken as jest.Mock).mockResolvedValue(undefined);

    const response = await GET(new NextRequest("http://localhost/api/recipes"));

    expect(response.status).toBe(401);
    expect(backendListRecipes).not.toHaveBeenCalled();
  });

  it("defaults sort/offset/limit and forwards them to the backend", async () => {
    (getSessionToken as jest.Mock).mockResolvedValue("tok123");
    (backendListRecipes as jest.Mock).mockResolvedValue({ items: [], page_size: 15, has_more: false });

    const response = await GET(new NextRequest("http://localhost/api/recipes"));

    expect(response.status).toBe(200);
    expect(backendListRecipes).toHaveBeenCalledWith("tok123", {
      sort: "recently_added",
      offset: 0,
      limit: 15,
    });
  });

  it("passes through explicit query params", async () => {
    (getSessionToken as jest.Mock).mockResolvedValue("tok123");
    (backendListRecipes as jest.Mock).mockResolvedValue({ items: [], page_size: 15, has_more: true });

    await GET(new NextRequest("http://localhost/api/recipes?sort=most_used&offset=15&limit=15"));

    expect(backendListRecipes).toHaveBeenCalledWith("tok123", {
      sort: "most_used",
      offset: 15,
      limit: 15,
    });
  });

  it("ignores an invalid sort value and falls back to the default", async () => {
    (getSessionToken as jest.Mock).mockResolvedValue("tok123");
    (backendListRecipes as jest.Mock).mockResolvedValue({ items: [], page_size: 15, has_more: false });

    await GET(new NextRequest("http://localhost/api/recipes?sort=not-a-real-sort"));

    expect(backendListRecipes).toHaveBeenCalledWith(
      "tok123",
      expect.objectContaining({ sort: "recently_added" })
    );
  });

  it("passes through the backend's error status and message", async () => {
    (getSessionToken as jest.Mock).mockResolvedValue("tok123");
    (backendListRecipes as jest.Mock).mockRejectedValue(new BackendApiError(502, "Bad gateway"));

    const response = await GET(new NextRequest("http://localhost/api/recipes"));

    expect(response.status).toBe(502);
  });
});

describe("POST /api/recipes", () => {
  function makeRequest(body: unknown) {
    return new NextRequest("http://localhost/api/recipes", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  it("requires authentication", async () => {
    (getSessionToken as jest.Mock).mockResolvedValue(undefined);

    const response = await POST(makeRequest({ name: "Pancakes" }));

    expect(response.status).toBe(401);
    expect(backendCreateRecipe).not.toHaveBeenCalled();
  });

  it("creates the recipe and returns 201", async () => {
    (getSessionToken as jest.Mock).mockResolvedValue("tok123");
    (backendCreateRecipe as jest.Mock).mockResolvedValue({ id: 1, name: "Pancakes" });

    const response = await POST(makeRequest({ name: "Pancakes" }));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual({ id: 1, name: "Pancakes" });
    expect(backendCreateRecipe).toHaveBeenCalledWith("tok123", { name: "Pancakes" });
  });

  it("returns field errors from a validation failure", async () => {
    (getSessionToken as jest.Mock).mockResolvedValue("tok123");
    (backendCreateRecipe as jest.Mock).mockRejectedValue(
      new BackendApiError(422, "Please fix the highlighted fields.", { name: "Required." })
    );

    const response = await POST(makeRequest({ name: "" }));
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.fieldErrors).toEqual({ name: "Required." });
  });
});
