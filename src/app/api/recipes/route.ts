import { NextRequest, NextResponse } from "next/server";
import { BackendApiError, backendCreateRecipe, backendListRecipes } from "@/lib/backendClient";
import { logger } from "@/lib/logger";
import { DEFAULT_RECIPE_SORT_ORDER, RECIPE_LIST_PAGE_SIZE, RecipeSortOrder } from "@/lib/recipes";
import { getSessionToken } from "@/lib/session";

const UNAUTHENTICATED_RESPONSE = NextResponse.json(
  { message: "You must be signed in." },
  { status: 401 }
);

function isRecipeSortOrder(value: string | null): value is RecipeSortOrder {
  return value === "recently_added" || value === "recently_used" || value === "most_used";
}

export async function GET(request: NextRequest) {
  const token = await getSessionToken();
  if (!token) {
    return UNAUTHENTICATED_RESPONSE;
  }

  const searchParams = request.nextUrl.searchParams;
  const sortParam = searchParams.get("sort");
  const sort = isRecipeSortOrder(sortParam) ? sortParam : DEFAULT_RECIPE_SORT_ORDER;
  const offset = Number(searchParams.get("offset") ?? "0") || 0;
  const limit = Number(searchParams.get("limit") ?? String(RECIPE_LIST_PAGE_SIZE)) || RECIPE_LIST_PAGE_SIZE;

  try {
    const page = await backendListRecipes(token, { sort, offset, limit });
    return NextResponse.json(page);
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    logger.error("Failed to list recipes unexpectedly", { error: String(error) });
    return NextResponse.json(
      { message: "Something went wrong on our end. Please try again in a moment." },
      { status: 502 }
    );
  }
}

export async function POST(request: NextRequest) {
  const token = await getSessionToken();
  if (!token) {
    return UNAUTHENTICATED_RESPONSE;
  }

  const body = await request.json();

  try {
    const recipe = await backendCreateRecipe(token, body);
    return NextResponse.json(recipe, { status: 201 });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message, fieldErrors: error.fieldErrors },
        { status: error.status }
      );
    }
    logger.error("Failed to create recipe unexpectedly", { error: String(error) });
    return NextResponse.json(
      { message: "Something went wrong on our end. Please try again in a moment." },
      { status: 502 }
    );
  }
}
