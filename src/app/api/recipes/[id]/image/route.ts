import { NextRequest, NextResponse } from "next/server";
import {
  BackendApiError,
  backendDeleteRecipeImage,
  backendUploadRecipeImage,
} from "@/lib/backendClient";
import { logger } from "@/lib/logger";
import { getSessionToken } from "@/lib/session";

const UNAUTHENTICATED_RESPONSE = NextResponse.json(
  { message: "You must be signed in." },
  { status: 401 }
);

type RouteParams = { params: Promise<{ id: string }> };

function parseRecipeId(idParam: string): number | null {
  const id = Number(idParam);
  return Number.isInteger(id) ? id : null;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const token = await getSessionToken();
  if (!token) {
    return UNAUTHENTICATED_RESPONSE;
  }

  const id = parseRecipeId((await params).id);
  if (id === null) {
    return NextResponse.json({ message: "Recipe not found." }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof Blob)) {
    return NextResponse.json({ message: "No photo was uploaded." }, { status: 422 });
  }

  try {
    const recipe = await backendUploadRecipeImage(token, id, file);
    return NextResponse.json(recipe);
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    logger.error("Failed to upload recipe photo unexpectedly", { error: String(error) });
    return NextResponse.json(
      { message: "Something went wrong on our end. Please try again in a moment." },
      { status: 502 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const token = await getSessionToken();
  if (!token) {
    return UNAUTHENTICATED_RESPONSE;
  }

  const id = parseRecipeId((await params).id);
  if (id === null) {
    return NextResponse.json({ message: "Recipe not found." }, { status: 404 });
  }

  try {
    const recipe = await backendDeleteRecipeImage(token, id);
    return NextResponse.json(recipe);
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    logger.error("Failed to remove recipe photo unexpectedly", { error: String(error) });
    return NextResponse.json(
      { message: "Something went wrong on our end. Please try again in a moment." },
      { status: 502 }
    );
  }
}
