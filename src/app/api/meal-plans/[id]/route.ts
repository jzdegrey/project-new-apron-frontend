import { NextRequest, NextResponse } from "next/server";
import {
  BackendApiError,
  backendDeleteMealPlan,
  backendGetMealPlan,
  backendUpdateMealPlan,
} from "@/lib/backendClient";
import { logger } from "@/lib/logger";
import { getSessionToken } from "@/lib/session";

const UNAUTHENTICATED_RESPONSE = NextResponse.json(
  { message: "You must be signed in." },
  { status: 401 }
);

type RouteParams = { params: Promise<{ id: string }> };

function parseId(idParam: string): number | null {
  const id = Number(idParam);
  return Number.isInteger(id) ? id : null;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const token = await getSessionToken();
  if (!token) {
    return UNAUTHENTICATED_RESPONSE;
  }

  const id = parseId((await params).id);
  if (id === null) {
    return NextResponse.json({ message: "Meal plan not found." }, { status: 404 });
  }

  try {
    const mealPlan = await backendGetMealPlan(token, id);
    if (!mealPlan) {
      return NextResponse.json({ message: "Meal plan not found." }, { status: 404 });
    }
    return NextResponse.json(mealPlan);
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    logger.error("Failed to fetch meal plan unexpectedly", { error: String(error) });
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

  const id = parseId((await params).id);
  if (id === null) {
    return NextResponse.json({ message: "Meal plan not found." }, { status: 404 });
  }

  const body = await request.json();

  try {
    const mealPlan = await backendUpdateMealPlan(token, id, body);
    return NextResponse.json(mealPlan);
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message, fieldErrors: error.fieldErrors },
        { status: error.status }
      );
    }
    logger.error("Failed to update meal plan unexpectedly", { error: String(error) });
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

  const id = parseId((await params).id);
  if (id === null) {
    return NextResponse.json({ message: "Meal plan not found." }, { status: 404 });
  }

  try {
    await backendDeleteMealPlan(token, id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    logger.error("Failed to delete meal plan unexpectedly", { error: String(error) });
    return NextResponse.json(
      { message: "Something went wrong on our end. Please try again in a moment." },
      { status: 502 }
    );
  }
}
