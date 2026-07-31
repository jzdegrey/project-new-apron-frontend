"use client";

import { useState } from "react";
import { formatQuantity } from "@/lib/fraction";
import { matchIngredientSegments } from "@/lib/ingredientMatch";
import { INGREDIENT_UNIT_LABELS, type IngredientUnit } from "@/lib/units";

export interface IngredientDetail {
  name: string;
  quantity: number;
  unit: IngredientUnit;
}

interface DirectionTextProps {
  text: string;
  ingredients: IngredientDetail[];
}

/** Renders a direction step's text, highlighting recognized ingredient names.
 * Tapping/clicking a highlighted ingredient shows its quantity + unit. */
export function DirectionText({ text, ingredients }: DirectionTextProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const segments = matchIngredientSegments(
    text,
    ingredients.map((ingredient) => ingredient.name)
  );

  return (
    <span>
      {segments.map((segment, index) => {
        if (segment.ingredientIndex === null) {
          return <span key={index}>{segment.text}</span>;
        }
        const ingredient = ingredients[segment.ingredientIndex];
        const isActive = activeIndex === segment.ingredientIndex;
        return (
          <span key={index} className="relative inline-block">
            <button
              type="button"
              className="rounded bg-orange-100 px-0.5 font-medium text-orange-800 underline decoration-orange-400 decoration-dotted underline-offset-2"
              onClick={() => setActiveIndex(isActive ? null : segment.ingredientIndex)}
              aria-expanded={isActive}
            >
              {segment.text}
            </button>
            {isActive && (
              <span
                role="tooltip"
                className="absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-lg bg-stone-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg"
              >
                {formatQuantity(ingredient.quantity)} {INGREDIENT_UNIT_LABELS[ingredient.unit]}{" "}
                {ingredient.name}
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}
