/** Types for the Recipe Portal (SCRUM-23), mirroring the backend's recipe schemas. */

import type { IngredientUnit } from "@/lib/units";

export type RecipeSortOrder = "recently_added" | "recently_used" | "most_used";

export const RECIPE_SORT_LABELS: Record<RecipeSortOrder, string> = {
  recently_added: "Recently added",
  recently_used: "Recently used",
  most_used: "Most often used",
};

export const DEFAULT_RECIPE_SORT_ORDER: RecipeSortOrder = "recently_added";

export const RECIPE_LIST_PAGE_SIZE = 15;

export interface RecipeIngredient {
  id: number;
  quantity: string;
  unit: IngredientUnit;
  name: string;
  cost: string;
}

export interface RecipeDirection {
  id: number;
  step_text: string;
}

export interface Recipe {
  id: number;
  name: string;
  description: string | null;
  notes: string | null;
  image_url: string | null;
  ingredients: RecipeIngredient[];
  directions: RecipeDirection[];
  last_used_in_meal_plan: string | null;
}

export interface RecipeListItem {
  id: number;
  name: string;
  description: string | null;
  image_url: string | null;
  last_used_in_meal_plan: string | null;
}

export interface RecipeListPage {
  items: RecipeListItem[];
  page_size: number;
  has_more: boolean;
}

export interface RecipeIngredientInput {
  quantity: string;
  unit: IngredientUnit;
  name: string;
}

export interface RecipeDirectionInput {
  step_text: string;
}

export interface RecipeWriteInput {
  name: string;
  description: string;
  notes: string;
  ingredients: RecipeIngredientInput[];
  directions: RecipeDirectionInput[];
}
