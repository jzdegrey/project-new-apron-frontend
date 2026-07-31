/** Ingredient measurement types. Mirrors the backend's `IngredientUnit` enum
 * (see the backend's `app/schemas/recipe.py`) so the two stay in sync. */

export type IngredientUnit =
  | "tsp"
  | "tbsp"
  | "cup"
  | "fl_oz"
  | "pint"
  | "quart"
  | "gallon"
  | "oz"
  | "lb"
  | "ml"
  | "l"
  | "g"
  | "kg"
  | "pinch"
  | "dash"
  | "whole"
  | "clove"
  | "slice"
  | "can"
  | "package";

export const INGREDIENT_UNIT_LABELS: Record<IngredientUnit, string> = {
  tsp: "tsp",
  tbsp: "tbsp",
  cup: "cup",
  fl_oz: "fl oz",
  pint: "pint",
  quart: "quart",
  gallon: "gallon",
  oz: "oz",
  lb: "lb",
  ml: "mL",
  l: "L",
  g: "g",
  kg: "kg",
  pinch: "pinch",
  dash: "dash",
  whole: "whole",
  clove: "clove",
  slice: "slice",
  can: "can",
  package: "package",
};

export const INGREDIENT_UNITS = Object.keys(INGREDIENT_UNIT_LABELS) as IngredientUnit[];
