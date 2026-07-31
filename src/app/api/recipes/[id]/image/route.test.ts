import { NextRequest } from "next/server";
import { DELETE, POST } from "./route";
import {
  BackendApiError,
  backendDeleteRecipeImage,
  backendUploadRecipeImage,
} from "@/lib/backendClient";
import { getSessionToken } from "@/lib/session";

jest.mock("../../../../../lib/backendClient", () => ({
  ...jest.requireActual("../../../../../lib/backendClient"),
  backendUploadRecipeImage: jest.fn(),
  backendDeleteRecipeImage: jest.fn(),
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

describe("POST /api/recipes/[id]/image", () => {
  it("requires authentication", async () => {
    (getSessionToken as jest.Mock).mockResolvedValue(undefined);

    const formData = new FormData();
    formData.append("file", new Blob(["fake"], { type: "image/png" }));
    const request = new NextRequest("http://localhost/api/recipes/1/image", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request, makeParams("1"));

    expect(response.status).toBe(401);
    expect(backendUploadRecipeImage).not.toHaveBeenCalled();
  });

  it("rejects a request with no file", async () => {
    (getSessionToken as jest.Mock).mockResolvedValue("tok123");

    const formData = new FormData();
    const request = new NextRequest("http://localhost/api/recipes/1/image", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request, makeParams("1"));

    expect(response.status).toBe(422);
    expect(backendUploadRecipeImage).not.toHaveBeenCalled();
  });

  it("uploads the file and returns the updated recipe", async () => {
    (getSessionToken as jest.Mock).mockResolvedValue("tok123");
    (backendUploadRecipeImage as jest.Mock).mockResolvedValue({
      id: 1,
      image_url: "/media/recipes/abc.png",
    });

    const formData = new FormData();
    formData.append("file", new Blob(["fake"], { type: "image/png" }), "photo.png");
    const request = new NextRequest("http://localhost/api/recipes/1/image", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request, makeParams("1"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.image_url).toBe("/media/recipes/abc.png");
    expect(backendUploadRecipeImage).toHaveBeenCalledWith("tok123", 1, expect.any(Blob));
  });

  it("passes through a validation error from the backend", async () => {
    (getSessionToken as jest.Mock).mockResolvedValue("tok123");
    (backendUploadRecipeImage as jest.Mock).mockRejectedValue(
      new BackendApiError(422, "Photo must be no larger than 2MB.")
    );

    const formData = new FormData();
    formData.append("file", new Blob(["fake"], { type: "image/png" }), "photo.png");
    const request = new NextRequest("http://localhost/api/recipes/1/image", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request, makeParams("1"));

    expect(response.status).toBe(422);
  });
});

describe("DELETE /api/recipes/[id]/image", () => {
  it("requires authentication", async () => {
    (getSessionToken as jest.Mock).mockResolvedValue(undefined);

    const response = await DELETE(
      new NextRequest("http://localhost/api/recipes/1/image", { method: "DELETE" }),
      makeParams("1")
    );

    expect(response.status).toBe(401);
    expect(backendDeleteRecipeImage).not.toHaveBeenCalled();
  });

  it("removes the image and returns the updated recipe", async () => {
    (getSessionToken as jest.Mock).mockResolvedValue("tok123");
    (backendDeleteRecipeImage as jest.Mock).mockResolvedValue({ id: 1, image_url: null });

    const response = await DELETE(
      new NextRequest("http://localhost/api/recipes/1/image", { method: "DELETE" }),
      makeParams("1")
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.image_url).toBeNull();
  });
});
