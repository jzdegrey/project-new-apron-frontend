"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CreateRecipeModal } from "@/components/recipes/CreateRecipeModal";
import { RECIPE_SORT_LABELS, type Recipe, type RecipeListItem, type RecipeSortOrder } from "@/lib/recipes";

export interface AttachedRecipe {
  id: number;
  name: string;
  image_url: string | null;
}

interface RecipeAttachPickerProps {
  attachedRecipes: AttachedRecipe[];
  onAdd: (recipe: AttachedRecipe) => void;
  onRemove: (recipeId: number) => void;
}

/** Search + sort + select a recipe to attach to a meal, with an inline
 * "create a recipe on the fly" modal. Used both when building a new meal
 * (selection is held locally until the meal is created) and when adding
 * recipes to an existing meal (selection attaches immediately). */
export function RecipeAttachPicker({ attachedRecipes, onAdd, onRemove }: RecipeAttachPickerProps) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<RecipeSortOrder>("recently_added");
  const [items, setItems] = useState<RecipeListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-search/sort-change loading indicator, not derivable from props/state alone
    setLoading(true);
    const query = new URLSearchParams({ sort, limit: "50" });
    if (search.trim()) {
      query.set("search", search.trim());
    }
    fetch(`/api/recipes?${query}`, { cache: "no-store" })
      .then((response) => response.json())
      .then((page: { items: RecipeListItem[] }) => {
        if (!cancelled) {
          setItems(page.items ?? []);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [search, sort]);

  const attachedIds = new Set(attachedRecipes.map((recipe) => recipe.id));
  const availableItems = items.filter((item) => !attachedIds.has(item.id));

  function handleCreated(recipe: Recipe) {
    setShowCreateModal(false);
    onAdd({ id: recipe.id, name: recipe.name, image_url: recipe.image_url });
  }

  return (
    <div className="flex flex-col gap-4">
      {attachedRecipes.length > 0 && (
        <ul className="flex flex-col gap-2">
          {attachedRecipes.map((recipe) => (
            <li
              key={recipe.id}
              className="flex items-center justify-between rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm"
            >
              <Link href={`/recipes/${recipe.id}`} className="font-medium text-stone-900 hover:underline">
                {recipe.name}
              </Link>
              <button
                type="button"
                onClick={() => onRemove(recipe.id)}
                className="text-sm font-medium text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-white p-4">
        <div className="flex flex-wrap gap-3">
          <input
            aria-label="Search recipes"
            className="min-w-40 flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 shadow-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            placeholder="Search recipes"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            aria-label="Sort recipes"
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 shadow-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            value={sort}
            onChange={(event) => setSort(event.target.value as RecipeSortOrder)}
          >
            {(Object.entries(RECIPE_SORT_LABELS) as [RecipeSortOrder, string][]).map(
              ([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              )
            )}
          </select>
        </div>

        {loading ? (
          <p className="text-sm text-stone-500">Loading…</p>
        ) : availableItems.length === 0 ? (
          <p className="text-sm text-stone-500">No recipes found.</p>
        ) : (
          <ul className="flex max-h-64 flex-col gap-2 overflow-y-auto">
            {availableItems.map((recipe) => (
              <li key={recipe.id}>
                <button
                  type="button"
                  onClick={() => onAdd({ id: recipe.id, name: recipe.name, image_url: recipe.image_url })}
                  className="flex w-full items-center justify-between rounded-lg border border-stone-200 px-3 py-2 text-left text-sm text-stone-700 transition-colors hover:border-orange-300 hover:bg-orange-50"
                >
                  <span>{recipe.name}</span>
                  <span className="text-xs font-medium text-orange-600">Add</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="self-start text-sm font-medium text-orange-600 hover:text-orange-700"
        >
          + Create a new recipe
        </button>
      </div>

      <CreateRecipeModal
        open={showCreateModal}
        onCreated={handleCreated}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
