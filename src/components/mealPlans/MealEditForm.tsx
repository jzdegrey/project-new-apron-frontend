"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { MEAL_TYPE_LABELS, MEAL_TYPES, type Meal, type MealType } from "@/lib/mealPlans";

const fieldLabelClass = "text-sm font-semibold text-stone-700";
const fieldInputClass =
  "rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 shadow-sm outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 aria-[invalid=true]:border-red-500";
const errorTextClass = "m-0 text-sm text-red-600";

interface MealEditFormProps {
  mealPlanId: number;
  planStartDate: string;
  planEndDate: string;
  meal: Meal;
}

/** Edit-mode only touches meal_type/day, per the ticket — recipes are
 * added/removed directly from the meal view page. */
export function MealEditForm({ mealPlanId, planStartDate, planEndDate, meal }: MealEditFormProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [mealType, setMealType] = useState<MealType>(meal.meal_type);
  const [day, setDay] = useState(meal.day);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const initialSnapshot = useRef(JSON.stringify({ mealType: meal.meal_type, day: meal.day }));
  const returnPath = `/meal-plans/${mealPlanId}/meals/${meal.id}`;

  function isDirty(): boolean {
    return JSON.stringify({ mealType, day }) !== initialSnapshot.current;
  }

  function handleCancel() {
    if (isDirty()) {
      setShowCancelConfirm(true);
    } else {
      router.push(returnPath);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const response = await fetch(`/api/meal-plans/${mealPlanId}/meals/${meal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meal_type: mealType, day }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setFormError(data.message ?? "Something went wrong. Please try again.");
        return;
      }
      router.push(returnPath);
    } catch {
      showToast("Unable to reach the server. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    setShowDeleteConfirm(false);
    try {
      const response = await fetch(`/api/meal-plans/${mealPlanId}/meals/${meal.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        showToast("Couldn't delete this meal. Please try again.");
        return;
      }
      router.push(`/meal-plans/${mealPlanId}`);
    } catch {
      showToast("Unable to reach the server. Please check your connection and try again.");
    }
  }

  return (
    <>
      <form className="flex w-full flex-col gap-6" onSubmit={handleSubmit} noValidate>
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-1 min-w-40 flex-col gap-1.5">
            <label htmlFor="edit-meal-type" className={fieldLabelClass}>
              Meal
            </label>
            <select
              id="edit-meal-type"
              className={fieldInputClass}
              value={mealType}
              onChange={(event) => setMealType(event.target.value as MealType)}
            >
              {MEAL_TYPES.map((type) => (
                <option key={type} value={type}>
                  {MEAL_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-1 min-w-40 flex-col gap-1.5">
            <label htmlFor="edit-meal-day" className={fieldLabelClass}>
              Day
            </label>
            <input
              id="edit-meal-day"
              type="date"
              className={fieldInputClass}
              value={day}
              min={planStartDate}
              max={planEndDate}
              onChange={(event) => setDay(event.target.value)}
            />
          </div>
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
            Save
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-lg border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-50"
          >
            Cancel
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700"
        >
          Delete Meal
        </button>
      </form>

      <ConfirmDialog
        open={showCancelConfirm}
        title="Discard changes?"
        message="You have unsaved changes. Are you sure you want to cancel? Any unsaved changes will be lost."
        confirmLabel="Discard changes"
        cancelLabel="Keep editing"
        danger
        onConfirm={() => router.push(returnPath)}
        onCancel={() => setShowCancelConfirm(false)}
      />

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete this meal?"
        message="This can't be undone. Are you sure you want to delete this meal?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}
