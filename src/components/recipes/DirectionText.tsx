"use client";

import { useEffect, useState } from "react";
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

const HOVER_POINTER_QUERY = "(hover: hover) and (pointer: fine)";

/** True when the viewer has a mouse-like pointer (desktop), false on
 * touch-only devices. Server-rendered as false (no `window`); the lazy
 * initializer re-evaluates on the client during hydration so there's no
 * extra render/flicker once mounted. */
function useHasHoverPointer(): boolean {
  const [hasHoverPointer, setHasHoverPointer] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia(HOVER_POINTER_QUERY).matches
  );

  useEffect(() => {
    const query = window.matchMedia(HOVER_POINTER_QUERY);
    function handleChange(event: MediaQueryListEvent) {
      setHasHoverPointer(event.matches);
    }
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  return hasHoverPointer;
}

/** Renders a direction step's text, highlighting recognized ingredient names.
 * On desktop with a mouse, hovering (or focusing) a highlighted ingredient
 * shows its quantity + unit, and the popup persists only while hovered.
 * On touch devices, tapping toggles the popup instead, since there's no
 * hover state to key off of. */
export function DirectionText({ text, ingredients }: DirectionTextProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const hasHoverPointer = useHasHoverPointer();
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
          <span
            key={index}
            className="relative inline-block"
            onMouseEnter={
              hasHoverPointer ? () => setActiveIndex(segment.ingredientIndex) : undefined
            }
            onMouseLeave={hasHoverPointer ? () => setActiveIndex(null) : undefined}
          >
            <button
              type="button"
              className="rounded bg-orange-100 px-0.5 font-medium text-orange-800 underline decoration-orange-400 decoration-dotted underline-offset-2"
              onClick={
                hasHoverPointer
                  ? undefined
                  : () => setActiveIndex(isActive ? null : segment.ingredientIndex)
              }
              onFocus={hasHoverPointer ? () => setActiveIndex(segment.ingredientIndex) : undefined}
              onBlur={hasHoverPointer ? () => setActiveIndex(null) : undefined}
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
