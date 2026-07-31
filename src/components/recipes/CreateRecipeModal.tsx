"use client";

import { useEffect } from "react";
import type { Recipe } from "@/lib/recipes";
import { RecipeForm } from "@/components/recipes/RecipeForm";

interface CreateRecipeModalProps {
  open: boolean;
  onCreated: (recipe: Recipe) => void;
  onClose: () => void;
}

/** "Create a recipe on the fly" — reuses the full Create Recipe form as a modal,
 * per the ticket, so a user building a meal never has to leave the flow. */
export function CreateRecipeModal({ open, onCreated, onClose }: CreateRecipeModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stone-900/50 p-4 py-10">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Create a new recipe"
        className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-stone-900">Create Recipe</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-full p-1 text-stone-500 hover:bg-stone-100"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>
        <div className="mt-4">
          <RecipeForm mode="create" onSuccess={onCreated} onCancelOverride={onClose} />
        </div>
      </div>
    </div>
  );
}
