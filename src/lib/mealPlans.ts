/** Types for the Meal Planning Portal (SCRUM-24), mirroring the backend's meal plan schemas. */

export type MealType = "breakfast" | "brunch" | "lunch" | "dinner" | "dessert" | "snack";

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: "Breakfast",
  brunch: "Brunch",
  lunch: "Lunch",
  dinner: "Dinner",
  dessert: "Dessert",
  snack: "Snack",
};

/** Display/sort order within a day, per the ticket's "View Meal Plan Page" spec. */
export const MEAL_TYPES: MealType[] = ["breakfast", "brunch", "lunch", "dinner", "dessert", "snack"];

/**
 * Default-next-meal suggestion order: Breakfast, Lunch, and Dinner are the
 * "core" meals, so they're offered first; once a day has all three, suggest
 * Dessert, then Snack, then Brunch last.
 */
export const MEAL_TYPE_DEFAULT_SUGGESTION_ORDER: MealType[] = [
  "breakfast",
  "lunch",
  "dinner",
  "dessert",
  "snack",
  "brunch",
];

export const MEAL_PLAN_NAME_MAX_LENGTH = 120;
export const MEAL_PLAN_TEXT_MAX_LENGTH = 4098;
export const MEAL_PLAN_MIN_DAYS = 1;
export const MEAL_PLAN_MAX_DAYS = 30;
export const MEAL_PLAN_LIST_PAGE_SIZE = 15;

export interface MealRecipe {
  id: number;
  name: string;
  image_url: string | null;
}

export interface Meal {
  id: number;
  meal_type: MealType;
  day: string;
  recipes: MealRecipe[];
}

export interface MealPlan {
  id: number;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  meals: Meal[];
}

export interface MealPlanListItem {
  id: number;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  meal_count: number;
}

export interface MealPlanListPage {
  items: MealPlanListItem[];
  page_size: number;
  has_more: boolean;
}

export interface MealPlanWriteInput {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
}

export interface MealWriteInput {
  meal_type: MealType;
  day: string;
}

export type MealPlanBucket = "current" | "upcoming" | "past";

/** Today's date as a local YYYY-MM-DD string (not UTC) — the ticket stores
 * dates in UTC but requires bucketing against the viewer's local date. */
export function localDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Current/upcoming/past bucketing, done client-side per the ticket (dates
 * are plain YYYY-MM-DD strings, so lexical comparison is chronological). */
export function bucketForMealPlan(
  plan: { start_date: string; end_date: string },
  today: string = localDateString()
): MealPlanBucket {
  if (plan.start_date <= today && today <= plan.end_date) {
    return "current";
  }
  if (plan.start_date > today) {
    return "upcoming";
  }
  return "past";
}

export function addDaysToDateString(day: string, delta: number): string {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + delta);
  return date.toISOString().slice(0, 10);
}

/** The three "core" meals; once a day has all of them, meal-creation moves on
 * to the next day by default. */
const CORE_MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner"];

/**
 * Default day for a new meal: the earliest day in the plan's range that
 * doesn't yet have all three core meals (Breakfast, Lunch, Dinner). E.g. for
 * a 1/1-1/7 plan with Breakfast/Lunch/Dinner already on 1/1, this returns
 * 1/2. Falls back to the last day if the whole range is already full.
 */
export function defaultDayForNewMeal(
  existingMeals: { meal_type: MealType; day: string }[],
  planStartDate: string,
  planEndDate: string
): string {
  let day = planStartDate;
  while (day <= planEndDate) {
    const typesForDay = new Set(
      existingMeals.filter((meal) => meal.day === day).map((meal) => meal.meal_type)
    );
    if (!CORE_MEAL_TYPES.every((type) => typesForDay.has(type))) {
      return day;
    }
    day = addDaysToDateString(day, 1);
  }
  return planEndDate;
}

/**
 * Default meal type for a given day: the first not-yet-used type in
 * suggestion order (core meals first, then Dessert, Snack, Brunch).
 */
export function defaultMealTypeForDay(
  existingMeals: { meal_type: MealType; day: string }[],
  day: string
): MealType {
  const usedTypes = new Set(
    existingMeals.filter((meal) => meal.day === day).map((meal) => meal.meal_type)
  );
  const nextAvailable = MEAL_TYPE_DEFAULT_SUGGESTION_ORDER.find((type) => !usedTypes.has(type));
  return nextAvailable ?? MEAL_TYPE_DEFAULT_SUGGESTION_ORDER[MEAL_TYPE_DEFAULT_SUGGESTION_ORDER.length - 1];
}
