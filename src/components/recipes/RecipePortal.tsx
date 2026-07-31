"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "@/components/Toast";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import {
  DEFAULT_RECIPE_SORT_ORDER,
  RECIPE_LIST_PAGE_SIZE,
  RECIPE_SORT_LABELS,
  type RecipeListItem,
  type RecipeSortOrder,
} from "@/lib/recipes";

interface RecipePortalProps {
  initialItems: RecipeListItem[];
  initialHasMore: boolean;
}

export function RecipePortal({ initialItems, initialHasMore }: RecipePortalProps) {
  const [sortOrder, setSortOrder] = useState<RecipeSortOrder>(DEFAULT_RECIPE_SORT_ORDER);
  const [items, setItems] = useState<RecipeListItem[]>(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const { showToast } = useToast();

  const loadPage = useCallback(
    async (offset: number, sort: RecipeSortOrder, replace: boolean) => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/recipes?sort=${sort}&offset=${offset}&limit=${RECIPE_LIST_PAGE_SIZE}`,
          { cache: "no-store" }
        );
        if (!response.ok) {
          throw new Error(`Failed to load recipes (${response.status})`);
        }
        const page: { items: RecipeListItem[]; has_more: boolean } = await response.json();
        setItems((current) => (replace ? page.items : [...current, ...page.items]));
        setHasMore(page.has_more);
      } catch {
        showToast("Couldn't load recipes. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  function handleSortChange(nextSort: RecipeSortOrder) {
    setSortOrder(nextSort);
    loadPage(0, nextSort, true);
  }

  useEffect(() => {
    if (!hasMore || loading) {
      return;
    }
    const sentinel = sentinelRef.current;
    if (!sentinel) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadPage(items.length, sortOrder, false);
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-observe only when the page/count actually changes
  }, [hasMore, loading, items.length, sortOrder]);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold text-stone-900">Recipes</h1>
        <div className="flex items-center gap-3">
          <label htmlFor="recipe-sort" className="text-sm font-medium text-stone-600">
            Sort by
          </label>
          <select
            id="recipe-sort"
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            value={sortOrder}
            onChange={(event) => handleSortChange(event.target.value as RecipeSortOrder)}
          >
            {(Object.entries(RECIPE_SORT_LABELS) as [RecipeSortOrder, string][]).map(
              ([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              )
            )}
          </select>
          <Link
            href="/recipes/new"
            aria-label="Create recipe"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-600 text-white shadow-sm transition-colors hover:bg-orange-700"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
              <path d="M10 4a1 1 0 0 1 1 1v4h4a1 1 0 1 1 0 2h-4v4a1 1 0 1 1-2 0v-4H5a1 1 0 1 1 0-2h4V5a1 1 0 0 1 1-1Z" />
            </svg>
          </Link>
        </div>
      </div>

      {items.length === 0 && !loading ? (
        <div className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center">
          <p className="text-sm text-stone-600">
            You haven&apos;t saved any recipes yet. Add one to get started.
          </p>
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((recipe) => (
            <li key={recipe.id}>
              <RecipeCard recipe={recipe} />
            </li>
          ))}
        </ul>
      )}

      <div ref={sentinelRef} className="h-1" />
      {loading && <p className="mt-6 text-center text-sm text-stone-500">Loading…</p>}
    </div>
  );
}
