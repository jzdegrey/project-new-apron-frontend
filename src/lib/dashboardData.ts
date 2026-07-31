/**
 * Types and data-access for the account dashboard (SCRUM-25).
 *
 * Meal plans and recipes have no backend storage yet — no DB schema exists for
 * either (intentionally, per SCRUM-25). getMealPlans/getRecipes always return
 * an empty list until that backend work lands; callers already treat them as
 * async so swapping the body for a real fetch later is a one-line change.
 */

export type MealPlanStatus = "active" | "upcoming" | "past";

export interface MealPlan {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: MealPlanStatus;
}

export type RecipeSortOrder = "recently_added" | "recently_used" | "most_used";

export interface Recipe {
  id: string;
  title: string;
  /** When the recipe was saved to this user's collection. */
  addedAt: string;
  /** When the recipe was last added to a meal plan. */
  lastUsedAt: string;
  /** How many times this recipe has been added to a meal plan. */
  usageCount: number;
}

export async function getMealPlans(): Promise<MealPlan[]> {
  return [];
}

export async function getRecipes(): Promise<Recipe[]> {
  return [];
}
