"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Recipe, RecipeSortOrder } from "@/lib/dashboardData";

const SORT_LABELS: Record<RecipeSortOrder, string> = {
  recently_added: "Recently added",
  recently_used: "Recently used",
  most_used: "Most often used",
};

const DEFAULT_SORT_ORDER: RecipeSortOrder = "recently_added";

function sortRecipes(recipes: Recipe[], order: RecipeSortOrder): Recipe[] {
  const sorted = [...recipes];
  switch (order) {
    case "recently_used":
      return sorted.sort(
        (a, b) => new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime()
      );
    case "most_used":
      return sorted.sort((a, b) => b.usageCount - a.usageCount);
    case "recently_added":
    default:
      return sorted.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
  }
}

export function RecipesSection({ recipes }: { recipes: Recipe[] }) {
  const [sortOrder, setSortOrder] = useState<RecipeSortOrder>(DEFAULT_SORT_ORDER);
  const sortedRecipes = useMemo(() => sortRecipes(recipes, sortOrder), [recipes, sortOrder]);

  return (
    <section aria-labelledby="recipes-heading" className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 id="recipes-heading" className="font-display text-2xl font-semibold text-stone-900">
          Recipes
        </h2>
        <div className="flex items-center gap-3">
          <label htmlFor="recipe-sort" className="text-sm font-medium text-stone-600">
            Sort by
          </label>
          <select
            id="recipe-sort"
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value as RecipeSortOrder)}
          >
            {(Object.entries(SORT_LABELS) as [RecipeSortOrder, string][]).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <Link
            href="/recipes/new"
            className="rounded-full bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-700"
          >
            Add Recipe
          </Link>
        </div>
      </div>

      {sortedRecipes.length > 0 ? (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedRecipes.map((recipe) => (
            <li key={recipe.id}>
              <Link
                href={`/recipes/${recipe.id}`}
                className="block rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition-colors hover:border-orange-300"
              >
                <h3 className="font-medium text-stone-900">{recipe.title}</h3>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center">
          <p className="text-sm text-stone-600">
            You haven&apos;t saved any recipes yet. Add one to get started.
          </p>
        </div>
      )}
    </section>
  );
}
