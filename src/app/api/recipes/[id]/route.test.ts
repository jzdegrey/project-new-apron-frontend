import { NextRequest } from "next/server";
import { DELETE, GET, PUT } from "./route";
import {
  BackendApiError,
  backendDeleteRecipe,
  backendGetRecipe,
  backendUpdateRecipe,
} from "@/lib/backendClient";
import { getSessionToken } from "@/lib/session";

jest.mock("../../../../lib/backendClient", () => ({
  ...jest.requireActual("../../../../lib/backendClient"),
  backendGetRecipe: jest.fn(),
  backendUpdateRecipe: jest.fn(),
  backendDeleteRecipe: jest.fn(),
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

describe("GET /api/recipes/[id]", () => {
  it("requires authentication", async () => {
    (getSessionToken as jest.Mock).mockResolvedValue(undefined);

    const response = await GET(new NextRequest("http://localhost/api/recipes/1"), makeParams("1"));

    expect(response.status).toBe(401);
  });

  it("returns 404 for a non-numeric id without calling the backend", async () => {
    (getSessionToken as jest.Mock).mockResolvedValue("tok123");

    const response = await GET(
      new NextRequest("http://localhost/api/recipes/abc"),
      makeParams("abc")
    );

    expect(response.status).toBe(404);
    expect(backendGetRecipe).not.toHaveBeenCalled();
  });

  it("returns 404 when the backend has no such recipe", async () => {
    (getSessionToken as jest.Mock).mockResolvedValue("tok123");
    (backendGetRecipe as jest.Mock).mockResolvedValue(null);

    const response = await GET(new NextRequest("http://localhost/api/recipes/1"), makeParams("1"));

    expect(response.status).toBe(404);
  });

  it("returns the recipe on success", async () => {
    (getSessionToken as jest.Mock).mockResolvedValue("tok123");
    (backendGetRecipe as jest.Mock).mockResolvedValue({ id: 1, name: "Pancakes" });

    const response = await GET(new NextRequest("http://localhost/api/recipes/1"), makeParams("1"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ id: 1, name: "Pancakes" });
    expect(backendGetRecipe).toHaveBeenCalledWith("tok123", 1);
  });
});

describe("PUT /api/recipes/[id]", () => {
  function makeRequest(body: unknown) {
    return new NextRequest("http://localhost/api/recipes/1", {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  it("requires authentication", async () => {
    (getSessionToken as jest.Mock).mockResolvedValue(undefined);

    const response = await PUT(makeRequest({ name: "Waffles" }), makeParams("1"));

    expect(response.status).toBe(401);
    expect(backendUpdateRecipe).not.toHaveBeenCalled();
  });

  it("updates the recipe and returns it", async () => {
    (getSessionToken as jest.Mock).mockResolvedValue("tok123");
    (backendUpdateRecipe as jest.Mock).mockResolvedValue({ id: 1, name: "Waffles" });

    const response = await PUT(makeRequest({ name: "Waffles" }), makeParams("1"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ id: 1, name: "Waffles" });
    expect(backendUpdateRecipe).toHaveBeenCalledWith("tok123", 1, { name: "Waffles" });
  });

  it("passes through a not-found error from the backend", async () => {
    (getSessionToken as jest.Mock).mockResolvedValue("tok123");
    (backendUpdateRecipe as jest.Mock).mockRejectedValue(
      new BackendApiError(404, "Recipe not found.")
    );

    const response = await PUT(makeRequest({ name: "Waffles" }), makeParams("1"));

    expect(response.status).toBe(404);
  });
});

describe("DELETE /api/recipes/[id]", () => {
  it("requires authentication", async () => {
    (getSessionToken as jest.Mock).mockResolvedValue(undefined);

    const response = await DELETE(
      new NextRequest("http://localhost/api/recipes/1", { method: "DELETE" }),
      makeParams("1")
    );

    expect(response.status).toBe(401);
    expect(backendDeleteRecipe).not.toHaveBeenCalled();
  });

  it("deletes the recipe and returns 204", async () => {
    (getSessionToken as jest.Mock).mockResolvedValue("tok123");
    (backendDeleteRecipe as jest.Mock).mockResolvedValue(undefined);

    const response = await DELETE(
      new NextRequest("http://localhost/api/recipes/1", { method: "DELETE" }),
      makeParams("1")
    );

    expect(response.status).toBe(204);
    expect(backendDeleteRecipe).toHaveBeenCalledWith("tok123", 1);
  });
});
