"use client";

import { useState } from "react";
import { useToast } from "@/components/Toast";
import { RecipeAttachPicker, type AttachedRecipe } from "@/components/mealPlans/RecipeAttachPicker";
import { MEAL_TYPE_LABELS, type Meal } from "@/lib/mealPlans";

const dayFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

interface MealDetailViewProps {
  mealPlanId: number;
  initialMeal: Meal;
}

export function MealDetailView({ mealPlanId, initialMeal }: MealDetailViewProps) {
  const { showToast } = useToast();
  const [meal, setMeal] = useState<Meal>(initialMeal);

  async function handleAdd(recipe: AttachedRecipe) {
    try {
      const response = await fetch(
        `/api/meal-plans/${mealPlanId}/meals/${meal.id}/recipes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipe_id: recipe.id }),
        }
      );
      if (!response.ok) {
        showToast(`Couldn't attach "${recipe.name}". Please try again.`);
        return;
      }
      const updatedMeal: Meal = await response.json();
      setMeal(updatedMeal);
    } catch {
      showToast("Unable to reach the server. Please check your connection and try again.");
    }
  }

  async function handleRemove(recipeId: number) {
    try {
      const response = await fetch(
        `/api/meal-plans/${mealPlanId}/meals/${meal.id}/recipes/${recipeId}`,
        { method: "DELETE" }
      );
      if (!response.ok) {
        showToast("Couldn't remove that recipe. Please try again.");
        return;
      }
      const updatedMeal: Meal = await response.json();
      setMeal(updatedMeal);
    } catch {
      showToast("Unable to reach the server. Please check your connection and try again.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wide text-orange-700">
          {MEAL_TYPE_LABELS[meal.meal_type]}
        </span>
        <p className="mt-1 text-stone-600">{dayFormatter.format(new Date(`${meal.day}T00:00:00Z`))}</p>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="font-display text-xl font-semibold text-stone-900">Recipes</h2>
        <RecipeAttachPicker attachedRecipes={meal.recipes} onAdd={handleAdd} onRemove={handleRemove} />
      </div>
    </div>
  );
}
