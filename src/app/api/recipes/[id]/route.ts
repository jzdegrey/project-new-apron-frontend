import { NextRequest, NextResponse } from "next/server";
import {
  BackendApiError,
  backendDeleteRecipe,
  backendGetRecipe,
  backendUpdateRecipe,
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

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const token = await getSessionToken();
  if (!token) {
    return UNAUTHENTICATED_RESPONSE;
  }

  const id = parseRecipeId((await params).id);
  if (id === null) {
    return NextResponse.json({ message: "Recipe not found." }, { status: 404 });
  }

  try {
    const recipe = await backendGetRecipe(token, id);
    if (!recipe) {
      return NextResponse.json({ message: "Recipe not found." }, { status: 404 });
    }
    return NextResponse.json(recipe);
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    logger.error("Failed to fetch recipe unexpectedly", { error: String(error) });
    return NextResponse.json(
      { message: "Something went wrong on our end. Please try again in a moment." },
      { status: 502 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const token = await getSessionToken();
  if (!token) {
    return UNAUTHENTICATED_RESPONSE;
  }

  const id = parseRecipeId((await params).id);
  if (id === null) {
    return NextResponse.json({ message: "Recipe not found." }, { status: 404 });
  }

  const body = await request.json();

  try {
    const recipe = await backendUpdateRecipe(token, id, body);
    return NextResponse.json(recipe);
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message, fieldErrors: error.fieldErrors },
        { status: error.status }
      );
    }
    logger.error("Failed to update recipe unexpectedly", { error: String(error) });
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
    await backendDeleteRecipe(token, id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    logger.error("Failed to delete recipe unexpectedly", { error: String(error) });
    return NextResponse.json(
      { message: "Something went wrong on our end. Please try again in a moment." },
      { status: 502 }
    );
  }
}
