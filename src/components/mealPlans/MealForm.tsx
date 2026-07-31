"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { RecipeAttachPicker, type AttachedRecipe } from "@/components/mealPlans/RecipeAttachPicker";
import {
  defaultDayForNewMeal,
  defaultMealTypeForDay,
  MEAL_TYPE_LABELS,
  MEAL_TYPES,
  type Meal,
  type MealType,
} from "@/lib/mealPlans";

const fieldLabelClass = "text-sm font-semibold text-stone-700";
const fieldInputClass =
  "rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 shadow-sm outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 aria-[invalid=true]:border-red-500";
const errorTextClass = "m-0 text-sm text-red-600";

interface MealFormProps {
  mealPlanId: number;
  planStartDate: string;
  planEndDate: string;
  existingMeals: Meal[];
}

export function MealForm({ mealPlanId, planStartDate, planEndDate, existingMeals }: MealFormProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [initialDay] = useState(() => defaultDayForNewMeal(existingMeals, planStartDate, planEndDate));
  const [initialMealType] = useState<MealType>(() => defaultMealTypeForDay(existingMeals, initialDay));

  const [day, setDay] = useState(initialDay);
  const [mealType, setMealType] = useState<MealType>(initialMealType);
  const [attachedRecipes, setAttachedRecipes] = useState<AttachedRecipe[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const returnPath = `/meal-plans/${mealPlanId}`;

  function isDirty(): boolean {
    return day !== initialDay || mealType !== initialMealType || attachedRecipes.length > 0;
  }

  function handleCancel() {
    if (isDirty()) {
      setShowCancelConfirm(true);
    } else {
      router.push(returnPath);
    }
  }

  function handleDayChange(nextDay: string) {
    setDay(nextDay);
    const stillAvailable = !existingMeals.some(
      (meal) => meal.day === nextDay && meal.meal_type === mealType
    );
    if (!stillAvailable) {
      setMealType(defaultMealTypeForDay(existingMeals, nextDay));
    }
  }

  const mealTypeTaken = existingMeals.some((meal) => meal.day === day && meal.meal_type === mealType);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    if (mealTypeTaken) {
      setFormError(`A ${MEAL_TYPE_LABELS[mealType].toLowerCase()} meal already exists for this day.`);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/meal-plans/${mealPlanId}/meals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meal_type: mealType, day }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setFormError(data.message ?? "Something went wrong. Please try again.");
        return;
      }
      const meal = await response.json();

      for (const recipe of attachedRecipes) {
        const attachResponse = await fetch(
          `/api/meal-plans/${mealPlanId}/meals/${meal.id}/recipes`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ recipe_id: recipe.id }),
          }
        );
        if (!attachResponse.ok) {
          showToast(`Meal created, but couldn't attach "${recipe.name}".`);
        }
      }

      router.push(returnPath);
    } catch {
      showToast("Unable to reach the server. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <form className="flex w-full flex-col gap-6" onSubmit={handleSubmit} noValidate>
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-1 min-w-40 flex-col gap-1.5">
            <label htmlFor="meal-type" className={fieldLabelClass}>
              Meal
            </label>
            <select
              id="meal-type"
              className={fieldInputClass}
              value={mealType}
              onChange={(event) => setMealType(event.target.value as MealType)}
              aria-invalid={mealTypeTaken}
            >
              {MEAL_TYPES.map((type) => (
                <option key={type} value={type}>
                  {MEAL_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-1 min-w-40 flex-col gap-1.5">
            <label htmlFor="meal-day" className={fieldLabelClass}>
              Day
            </label>
            <input
              id="meal-day"
              type="date"
              className={fieldInputClass}
              value={day}
              min={planStartDate}
              max={planEndDate}
              onChange={(event) => handleDayChange(event.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className={fieldLabelClass}>Recipes (optional)</span>
          <RecipeAttachPicker
            attachedRecipes={attachedRecipes}
            onAdd={(recipe) => setAttachedRecipes((current) => [...current, recipe])}
            onRemove={(recipeId) =>
              setAttachedRecipes((current) => current.filter((recipe) => recipe.id !== recipeId))
            }
          />
        </div>

        {formError && (
          <p className={errorTextClass} role="alert">
            {formError}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Add Meal
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-lg border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-50"
          >
            Cancel
          </button>
        </div>
      </form>

      <ConfirmDialog
        open={showCancelConfirm}
        title="Discard this meal?"
        message="You have unsaved changes. Are you sure you want to cancel? Any unsaved changes will be lost."
        confirmLabel="Discard changes"
        cancelLabel="Keep editing"
        danger
        onConfirm={() => router.push(returnPath)}
        onCancel={() => setShowCancelConfirm(false)}
      />
    </>
  );
}
