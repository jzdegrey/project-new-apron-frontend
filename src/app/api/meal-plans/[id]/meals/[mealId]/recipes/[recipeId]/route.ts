import { NextRequest, NextResponse } from "next/server";
import { BackendApiError, backendDetachRecipeFromMeal } from "@/lib/backendClient";
import { logger } from "@/lib/logger";
import { getSessionToken } from "@/lib/session";

const UNAUTHENTICATED_RESPONSE = NextResponse.json(
  { message: "You must be signed in." },
  { status: 401 }
);

type RouteParams = { params: Promise<{ id: string; mealId: string; recipeId: string }> };

function parseId(idParam: string): number | null {
  const id = Number(idParam);
  return Number.isInteger(id) ? id : null;
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const token = await getSessionToken();
  if (!token) {
    return UNAUTHENTICATED_RESPONSE;
  }

  const { id, mealId, recipeId } = await params;
  const mealPlanId = parseId(id);
  const parsedMealId = parseId(mealId);
  const parsedRecipeId = parseId(recipeId);
  if (mealPlanId === null || parsedMealId === null || parsedRecipeId === null) {
    return NextResponse.json({ message: "Meal not found." }, { status: 404 });
  }

  try {
    const meal = await backendDetachRecipeFromMeal(token, mealPlanId, parsedMealId, parsedRecipeId);
    return NextResponse.json(meal);
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    logger.error("Failed to detach recipe from meal unexpectedly", { error: String(error) });
    return NextResponse.json(
      { message: "Something went wrong on our end. Please try again in a moment." },
      { status: 502 }
    );
  }
}
