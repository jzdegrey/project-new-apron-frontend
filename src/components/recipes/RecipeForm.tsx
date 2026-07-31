"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DirectionStepField } from "@/components/recipes/DirectionStepField";
import { IngredientQuantityInput } from "@/components/recipes/IngredientQuantityInput";
import type { IngredientDetail } from "@/components/recipes/DirectionText";
import { parseQuantityInput } from "@/lib/fraction";
import type { Recipe, RecipeWriteInput } from "@/lib/recipes";
import { INGREDIENT_UNITS, INGREDIENT_UNIT_LABELS, type IngredientUnit } from "@/lib/units";
import {
  DIRECTION_STEP_MAX_LENGTH,
  RECIPE_NAME_MAX_LENGTH,
  RECIPE_TEXT_MAX_LENGTH,
  validateDirectionStep,
  validateIngredientName,
  validateIngredientQuantity,
  validateRecipeDescription,
  validateRecipeImageFile,
  validateRecipeName,
  validateRecipeNotes,
} from "@/lib/validation";

const fieldLabelClass = "text-sm font-semibold text-stone-700";
const fieldInputClass =
  "rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 shadow-sm outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 aria-[invalid=true]:border-red-500";
const errorTextClass = "m-0 text-sm text-red-600";
const counterClass = "text-right text-xs text-stone-400";

interface IngredientRow {
  quantityText: string;
  unit: IngredientUnit;
  name: string;
}

interface DirectionRow {
  step_text: string;
}

interface FormState {
  name: string;
  description: string;
  notes: string;
  ingredients: IngredientRow[];
  directions: DirectionRow[];
}

interface FormErrors {
  name?: string;
  description?: string;
  notes?: string;
  image?: string;
  ingredients: (string | undefined)[];
  directions: (string | undefined)[];
  ingredientsRequired?: string;
  directionsRequired?: string;
}

function blankIngredientRow(): IngredientRow {
  return { quantityText: "1", unit: "tsp", name: "" };
}

function blankDirectionRow(): DirectionRow {
  return { step_text: "" };
}

function isBlankIngredientRow(row: IngredientRow): boolean {
  return row.name.trim() === "";
}

function isBlankDirectionRow(row: DirectionRow): boolean {
  return row.step_text.trim() === "";
}

function stateFromRecipe(recipe?: Recipe): FormState {
  if (!recipe) {
    return {
      name: "",
      description: "",
      notes: "",
      ingredients: [blankIngredientRow()],
      directions: [blankDirectionRow()],
    };
  }
  return {
    name: recipe.name,
    description: recipe.description ?? "",
    notes: recipe.notes ?? "",
    ingredients: recipe.ingredients.map((ingredient) => ({
      quantityText: ingredient.quantity,
      unit: ingredient.unit,
      name: ingredient.name,
    })),
    directions: recipe.directions.map((direction) => ({ step_text: direction.step_text })),
  };
}

function validateForm(state: FormState): { errors: FormErrors; isValid: boolean } {
  const errors: FormErrors = { ingredients: [], directions: [] };
  let isValid = true;

  const nameError = validateRecipeName(state.name);
  if (nameError) {
    errors.name = nameError;
    isValid = false;
  }
  const descriptionError = validateRecipeDescription(state.description);
  if (descriptionError) {
    errors.description = descriptionError;
    isValid = false;
  }
  const notesError = validateRecipeNotes(state.notes);
  if (notesError) {
    errors.notes = notesError;
    isValid = false;
  }

  let nonBlankIngredients = 0;
  state.ingredients.forEach((row, index) => {
    if (isBlankIngredientRow(row)) {
      return;
    }
    nonBlankIngredients += 1;
    const rowError =
      validateIngredientQuantity(parseQuantityInput(row.quantityText)) ??
      validateIngredientName(row.name);
    if (rowError) {
      errors.ingredients[index] = rowError;
      isValid = false;
    }
  });
  if (nonBlankIngredients === 0) {
    errors.ingredientsRequired = "At least one ingredient is required.";
    isValid = false;
  }

  let nonBlankDirections = 0;
  state.directions.forEach((row, index) => {
    if (isBlankDirectionRow(row)) {
      return;
    }
    nonBlankDirections += 1;
    const stepError = validateDirectionStep(row.step_text);
    if (stepError) {
      errors.directions[index] = stepError;
      isValid = false;
    }
  });
  if (nonBlankDirections === 0) {
    errors.directionsRequired = "At least one direction step is required.";
    isValid = false;
  }

  return { errors, isValid };
}

function buildPayload(state: FormState): RecipeWriteInput {
  return {
    name: state.name.trim(),
    description: state.description.trim(),
    notes: state.notes.trim(),
    ingredients: state.ingredients
      .filter((row) => !isBlankIngredientRow(row))
      .map((row) => ({
        quantity: String(parseQuantityInput(row.quantityText) ?? 1),
        unit: row.unit,
        name: row.name.trim(),
      })),
    directions: state.directions
      .filter((row) => !isBlankDirectionRow(row))
      .map((row) => ({ step_text: row.step_text.trim() })),
  };
}

interface RecipeFormProps {
  mode: "create" | "edit";
  recipeId?: number;
  initialRecipe?: Recipe;
  /** When provided (e.g. the "create a recipe on the fly" modal), called with
   * the saved recipe instead of navigating to its page. */
  onSuccess?: (recipe: Recipe) => void;
  /** When provided, called instead of navigating back on cancel. */
  onCancelOverride?: () => void;
}

export function RecipeForm({
  mode,
  recipeId,
  initialRecipe,
  onSuccess,
  onCancelOverride,
}: RecipeFormProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [state, setState] = useState<FormState>(() => stateFromRecipe(initialRecipe));
  const [errors, setErrors] = useState<FormErrors>({ ingredients: [], directions: [] });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(
    initialRecipe?.image_url ?? null
  );
  const [imageRemoved, setImageRemoved] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const initialSnapshot = useRef(JSON.stringify(stateFromRecipe(initialRecipe)));

  useEffect(() => {
    return () => {
      if (imagePreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const returnPath = mode === "edit" && recipeId ? `/recipes/${recipeId}` : "/recipes";

  function isDirty(): boolean {
    return JSON.stringify(state) !== initialSnapshot.current || imageFile !== null || imageRemoved;
  }

  function handleCancel() {
    if (isDirty()) {
      setShowCancelConfirm(true);
    } else if (onCancelOverride) {
      onCancelOverride();
    } else {
      router.push(returnPath);
    }
  }

  function updateIngredient(index: number, patch: Partial<IngredientRow>) {
    setState((current) => ({
      ...current,
      ingredients: current.ingredients.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    }));
  }

  function addIngredient() {
    setState((current) => ({ ...current, ingredients: [...current.ingredients, blankIngredientRow()] }));
  }

  function removeIngredient(index: number) {
    setState((current) => ({
      ...current,
      ingredients: current.ingredients.filter((_, i) => i !== index),
    }));
  }

  function updateDirection(index: number, stepText: string) {
    setState((current) => ({
      ...current,
      directions: current.directions.map((row, i) => (i === index ? { step_text: stepText } : row)),
    }));
  }

  function addDirection() {
    setState((current) => ({ ...current, directions: [...current.directions, blankDirectionRow()] }));
  }

  function removeDirection(index: number) {
    setState((current) => ({
      ...current,
      directions: current.directions.filter((_, i) => i !== index),
    }));
  }

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    const validationError = validateRecipeImageFile(file);
    if (validationError) {
      setErrors((current) => ({ ...current, image: validationError }));
      return;
    }
    setErrors((current) => ({ ...current, image: undefined }));
    setImageFile(file);
    setImageRemoved(false);
    setImagePreviewUrl(URL.createObjectURL(file));
  }

  function handleRemoveImage() {
    setImageFile(null);
    setImageRemoved(true);
    setImagePreviewUrl(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    const { errors: nextErrors, isValid } = validateForm(state);
    setErrors((current) => ({ ...nextErrors, image: current.image }));
    if (!isValid) {
      return;
    }

    setSubmitting(true);
    try {
      const endpoint = mode === "create" ? "/api/recipes" : `/api/recipes/${recipeId}`;
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

      const savedRecipe: Recipe = await response.json();

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        const imageResponse = await fetch(`/api/recipes/${savedRecipe.id}/image`, {
          method: "POST",
          body: formData,
        });
        if (!imageResponse.ok) {
          showToast("Recipe saved, but the photo couldn't be uploaded.");
        }
      } else if (imageRemoved && mode === "edit") {
        await fetch(`/api/recipes/${savedRecipe.id}/image`, { method: "DELETE" });
      }

      if (onSuccess) {
        onSuccess(savedRecipe);
      } else {
        router.push(`/recipes/${savedRecipe.id}`);
      }
    } catch {
      showToast("Unable to reach the server. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    setShowDeleteConfirm(false);
    if (!recipeId) {
      return;
    }
    try {
      const response = await fetch(`/api/recipes/${recipeId}`, { method: "DELETE" });
      if (!response.ok) {
        showToast("Couldn't delete this recipe. Please try again.");
        return;
      }
      router.push("/recipes");
    } catch {
      showToast("Unable to reach the server. Please check your connection and try again.");
    }
  }

  const ingredientDetails: IngredientDetail[] = state.ingredients
    .filter((row) => row.name.trim())
    .map((row) => ({
      name: row.name.trim(),
      quantity: parseQuantityInput(row.quantityText) ?? 1,
      unit: row.unit,
    }));

  return (
    <>
      <form className="flex w-full flex-col gap-6" onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="recipe-name" className={fieldLabelClass}>
            Recipe Name
          </label>
          <input
            id="recipe-name"
            className={fieldInputClass}
            value={state.name}
            maxLength={RECIPE_NAME_MAX_LENGTH}
            onChange={(event) => setState((current) => ({ ...current, name: event.target.value }))}
            aria-invalid={!!errors.name}
          />
          <p className={counterClass}>
            {state.name.length}/{RECIPE_NAME_MAX_LENGTH}
          </p>
          {errors.name && <p className={errorTextClass}>{errors.name}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="recipe-description" className={fieldLabelClass}>
            Description (optional)
          </label>
          <textarea
            id="recipe-description"
            className={`${fieldInputClass} min-h-20`}
            value={state.description}
            maxLength={RECIPE_TEXT_MAX_LENGTH}
            onChange={(event) =>
              setState((current) => ({ ...current, description: event.target.value }))
            }
            aria-invalid={!!errors.description}
          />
          <p className={counterClass}>
            {state.description.length}/{RECIPE_TEXT_MAX_LENGTH}
          </p>
          {errors.description && <p className={errorTextClass}>{errors.description}</p>}
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className={fieldLabelClass}>Ingredients</span>
            <button
              type="button"
              onClick={addIngredient}
              className="text-sm font-medium text-orange-600 hover:text-orange-700"
            >
              + Add ingredient
            </button>
          </div>
          {errors.ingredientsRequired && <p className={errorTextClass}>{errors.ingredientsRequired}</p>}
          <div className="flex flex-col gap-3">
            {state.ingredients.map((row, index) => (
              <div key={index} className="flex flex-wrap items-start gap-2">
                <IngredientQuantityInput
                  ariaLabel={`Ingredient ${index + 1} quantity`}
                  value={row.quantityText}
                  onChange={(value) => updateIngredient(index, { quantityText: value })}
                />
                <select
                  aria-label={`Ingredient ${index + 1} unit`}
                  className={fieldInputClass}
                  value={row.unit}
                  onChange={(event) =>
                    updateIngredient(index, { unit: event.target.value as IngredientUnit })
                  }
                >
                  {INGREDIENT_UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {INGREDIENT_UNIT_LABELS[unit]}
                    </option>
                  ))}
                </select>
                <input
                  aria-label={`Ingredient ${index + 1} name`}
                  className={`${fieldInputClass} min-w-40 flex-1`}
                  placeholder="Ingredient name"
                  value={row.name}
                  maxLength={30}
                  onChange={(event) => updateIngredient(index, { name: event.target.value })}
                  aria-invalid={!!errors.ingredients[index]}
                />
                <button
                  type="button"
                  aria-label={`Remove ingredient ${index + 1}`}
                  onClick={() => removeIngredient(index)}
                  className="rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-600 transition-colors hover:bg-stone-50"
                >
                  Remove
                </button>
                {errors.ingredients[index] && (
                  <p className={`${errorTextClass} w-full`}>{errors.ingredients[index]}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className={fieldLabelClass}>Directions</span>
            <button
              type="button"
              onClick={addDirection}
              className="text-sm font-medium text-orange-600 hover:text-orange-700"
            >
              + Add step
            </button>
          </div>
          {errors.directionsRequired && <p className={errorTextClass}>{errors.directionsRequired}</p>}
          <div className="flex flex-col gap-4">
            {state.directions.map((row, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="mt-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-200 text-xs font-semibold text-stone-700">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <DirectionStepField
                    ariaLabel={`Direction step ${index + 1}`}
                    value={row.step_text}
                    onChange={(value) => updateDirection(index, value)}
                    ingredients={ingredientDetails}
                    error={errors.directions[index]}
                  />
                  <p className={counterClass}>
                    {row.step_text.length}/{DIRECTION_STEP_MAX_LENGTH}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={`Remove step ${index + 1}`}
                  onClick={() => removeDirection(index)}
                  className="mt-2 rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-600 transition-colors hover:bg-stone-50"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="recipe-notes" className={fieldLabelClass}>
            Notes (optional)
          </label>
          <textarea
            id="recipe-notes"
            className={`${fieldInputClass} min-h-20`}
            value={state.notes}
            maxLength={RECIPE_TEXT_MAX_LENGTH}
            onChange={(event) => setState((current) => ({ ...current, notes: event.target.value }))}
            aria-invalid={!!errors.notes}
          />
          <p className={counterClass}>
            {state.notes.length}/{RECIPE_TEXT_MAX_LENGTH}
          </p>
          {errors.notes && <p className={errorTextClass}>{errors.notes}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <span className={fieldLabelClass}>Photo (optional)</span>
          {imagePreviewUrl ? (
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- local preview / user photo */}
              <img src={imagePreviewUrl} alt="" className="h-24 w-24 rounded-lg object-cover" />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="text-sm font-medium text-red-600 hover:text-red-700"
              >
                Remove photo
              </button>
            </div>
          ) : (
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleImageChange}
              className="text-sm text-stone-600"
            />
          )}
          {errors.image && <p className={errorTextClass}>{errors.image}</p>}
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
            {mode === "create" ? "Create Recipe" : "Save"}
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
            Delete Recipe
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
        onConfirm={() => (onCancelOverride ? onCancelOverride() : router.push(returnPath))}
        onCancel={() => setShowCancelConfirm(false)}
      />

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete this recipe?"
        message="This can't be undone. Are you sure you want to delete this recipe?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}
