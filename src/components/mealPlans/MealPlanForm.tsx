"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import type { MealPlan, MealPlanWriteInput } from "@/lib/mealPlans";
import {
  MEAL_PLAN_NAME_MAX_LENGTH,
  MEAL_PLAN_TEXT_MAX_LENGTH,
  validateMealPlanDateRange,
  validateMealPlanDescription,
  validateMealPlanName,
} from "@/lib/validation";

const fieldLabelClass = "text-sm font-semibold text-stone-700";
const fieldInputClass =
  "rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 shadow-sm outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 aria-[invalid=true]:border-red-500";
const errorTextClass = "m-0 text-sm text-red-600";
const counterClass = "text-right text-xs text-stone-400";

interface FormState {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
}

interface FormErrors {
  name?: string;
  description?: string;
  dateRange?: string;
}

function stateFromMealPlan(mealPlan?: MealPlan): FormState {
  if (!mealPlan) {
    return { name: "", description: "", start_date: "", end_date: "" };
  }
  return {
    name: mealPlan.name,
    description: mealPlan.description ?? "",
    start_date: mealPlan.start_date,
    end_date: mealPlan.end_date,
  };
}

function validateForm(state: FormState): { errors: FormErrors; isValid: boolean } {
  const errors: FormErrors = {};
  let isValid = true;

  const nameError = validateMealPlanName(state.name);
  if (nameError) {
    errors.name = nameError;
    isValid = false;
  }
  const descriptionError = validateMealPlanDescription(state.description);
  if (descriptionError) {
    errors.description = descriptionError;
    isValid = false;
  }
  const dateRangeError = validateMealPlanDateRange(state.start_date, state.end_date);
  if (dateRangeError) {
    errors.dateRange = dateRangeError;
    isValid = false;
  }

  return { errors, isValid };
}

function buildPayload(state: FormState): MealPlanWriteInput {
  return {
    name: state.name.trim(),
    description: state.description.trim(),
    start_date: state.start_date,
    end_date: state.end_date,
  };
}

interface MealPlanFormProps {
  mode: "create" | "edit";
  mealPlanId?: number;
  initialMealPlan?: MealPlan;
}

export function MealPlanForm({ mode, mealPlanId, initialMealPlan }: MealPlanFormProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [state, setState] = useState<FormState>(() => stateFromMealPlan(initialMealPlan));
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const initialSnapshot = useRef(JSON.stringify(stateFromMealPlan(initialMealPlan)));

  const returnPath =
    mode === "edit" && mealPlanId ? `/meal-plans/${mealPlanId}` : "/meal-plans";

  function isDirty(): boolean {
    return JSON.stringify(state) !== initialSnapshot.current;
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

    const { errors: nextErrors, isValid } = validateForm(state);
    setErrors(nextErrors);
    if (!isValid) {
      return;
    }

    setSubmitting(true);
    try {
      const endpoint = mode === "create" ? "/api/meal-plans" : `/api/meal-plans/${mealPlanId}`;
      const method = mode === "create" ? "POST" : "PUT";
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(state)),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setFormError(data.message ?? "Something went wrong. Please try again.");
        return;
      }

      const savedMealPlan: MealPlan = await response.json();
      router.push(`/meal-plans/${savedMealPlan.id}`);
    } catch {
      showToast("Unable to reach the server. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    setShowDeleteConfirm(false);
    if (!mealPlanId) {
      return;
    }
    try {
      const response = await fetch(`/api/meal-plans/${mealPlanId}`, { method: "DELETE" });
      if (!response.ok) {
        showToast("Couldn't delete this meal plan. Please try again.");
        return;
      }
      router.push("/meal-plans");
    } catch {
      showToast("Unable to reach the server. Please check your connection and try again.");
    }
  }

  return (
    <>
      <form className="flex w-full flex-col gap-6" onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="meal-plan-name" className={fieldLabelClass}>
            Meal Plan Name (optional)
          </label>
          <input
            id="meal-plan-name"
            className={fieldInputClass}
            value={state.name}
            maxLength={MEAL_PLAN_NAME_MAX_LENGTH}
            placeholder="Defaults to a name based on the date range"
            onChange={(event) => setState((current) => ({ ...current, name: event.target.value }))}
            aria-invalid={!!errors.name}
          />
          <p className={counterClass}>
            {state.name.length}/{MEAL_PLAN_NAME_MAX_LENGTH}
          </p>
          {errors.name && <p className={errorTextClass}>{errors.name}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="meal-plan-description" className={fieldLabelClass}>
            Description (optional)
          </label>
          <textarea
            id="meal-plan-description"
            className={`${fieldInputClass} min-h-20`}
            value={state.description}
            maxLength={MEAL_PLAN_TEXT_MAX_LENGTH}
            onChange={(event) =>
              setState((current) => ({ ...current, description: event.target.value }))
            }
            aria-invalid={!!errors.description}
          />
          <p className={counterClass}>
            {state.description.length}/{MEAL_PLAN_TEXT_MAX_LENGTH}
          </p>
          {errors.description && <p className={errorTextClass}>{errors.description}</p>}
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex flex-1 min-w-40 flex-col gap-1.5">
            <label htmlFor="meal-plan-start-date" className={fieldLabelClass}>
              Start Date
            </label>
            <input
              id="meal-plan-start-date"
              type="date"
              className={fieldInputClass}
              value={state.start_date}
              onChange={(event) =>
                setState((current) => ({ ...current, start_date: event.target.value }))
              }
              aria-invalid={!!errors.dateRange}
            />
          </div>
          <div className="flex flex-1 min-w-40 flex-col gap-1.5">
            <label htmlFor="meal-plan-end-date" className={fieldLabelClass}>
              End Date
            </label>
            <input
              id="meal-plan-end-date"
              type="date"
              className={fieldInputClass}
              value={state.end_date}
              onChange={(event) =>
                setState((current) => ({ ...current, end_date: event.target.value }))
              }
              aria-invalid={!!errors.dateRange}
            />
          </div>
        </div>
        {errors.dateRange && <p className={errorTextClass}>{errors.dateRange}</p>}

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
            {mode === "create" ? "Create Meal Plan" : "Save"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-lg border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-50"
          >
            Cancel
          </button>
        </div>

        {mode === "edit" && (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700"
          >
            Delete Meal Plan
          </button>
        )}
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
        title="Delete this meal plan?"
        message="This can't be undone. Are you sure you want to delete this meal plan?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}
