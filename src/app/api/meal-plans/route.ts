import { NextRequest, NextResponse } from "next/server";
import { BackendApiError, backendCreateMealPlan, backendListMealPlans } from "@/lib/backendClient";
import { logger } from "@/lib/logger";
import { MEAL_PLAN_LIST_PAGE_SIZE } from "@/lib/mealPlans";
import { getSessionToken } from "@/lib/session";

const UNAUTHENTICATED_RESPONSE = NextResponse.json(
  { message: "You must be signed in." },
  { status: 401 }
);

export async function GET(request: NextRequest) {
  const token = await getSessionToken();
  if (!token) {
    return UNAUTHENTICATED_RESPONSE;
  }

  const searchParams = request.nextUrl.searchParams;
  const offset = Number(searchParams.get("offset") ?? "0") || 0;
  const limit =
    Number(searchParams.get("limit") ?? String(MEAL_PLAN_LIST_PAGE_SIZE)) || MEAL_PLAN_LIST_PAGE_SIZE;

  try {
    const page = await backendListMealPlans(token, { offset, limit });
    return NextResponse.json(page);
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    logger.error("Failed to list meal plans unexpectedly", { error: String(error) });
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
    const mealPlan = await backendCreateMealPlan(token, body);
    return NextResponse.json(mealPlan, { status: 201 });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message, fieldErrors: error.fieldErrors },
        { status: error.status }
      );
    }
    logger.error("Failed to create meal plan unexpectedly", { error: String(error) });
    return NextResponse.json(
      { message: "Something went wrong on our end. Please try again in a moment." },
      { status: 502 }
    );
  }
}
