import { NextRequest, NextResponse } from "next/server";
import { BackendApiError, backendAttachRecipeToMeal } from "@/lib/backendClient";
import { logger } from "@/lib/logger";
import { getSessionToken } from "@/lib/session";

const UNAUTHENTICATED_RESPONSE = NextResponse.json(
  { message: "You must be signed in." },
  { status: 401 }
);

type RouteParams = { params: Promise<{ id: string; mealId: string }> };

function parseId(idParam: string): number | null {
  const id = Number(idParam);
  return Number.isInteger(id) ? id : null;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const token = await getSessionToken();
  if (!token) {
    return UNAUTHENTICATED_RESPONSE;
  }

  const { id, mealId } = await params;
  const mealPlanId = parseId(id);
  const parsedMealId = parseId(mealId);
  if (mealPlanId === null || parsedMealId === null) {
    return NextResponse.json({ message: "Meal not found." }, { status: 404 });
  }

  const body = await request.json();
  const recipeId = Number(body?.recipe_id);
  if (!Number.isInteger(recipeId)) {
    return NextResponse.json({ message: "recipe_id is required." }, { status: 422 });
  }

  try {
    const meal = await backendAttachRecipeToMeal(token, mealPlanId, parsedMealId, recipeId);
    return NextResponse.json(meal);
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    logger.error("Failed to attach recipe to meal unexpectedly", { error: String(error) });
    return NextResponse.json(
      { message: "Something went wrong on our end. Please try again in a moment." },
      { status: 502 }
    );
  }
}
