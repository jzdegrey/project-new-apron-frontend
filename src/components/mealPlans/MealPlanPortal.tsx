"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "@/components/Toast";
import { MealPlanCard } from "@/components/mealPlans/MealPlanCard";
import {
  bucketForMealPlan,
  localDateString,
  MEAL_PLAN_LIST_PAGE_SIZE,
  type MealPlanBucket,
  type MealPlanListItem,
} from "@/lib/mealPlans";

interface MealPlanPortalProps {
  initialItems: MealPlanListItem[];
  initialHasMore: boolean;
}

const BUCKET_SECTIONS: { bucket: MealPlanBucket; title: string }[] = [
  { bucket: "current", title: "Current" },
  { bucket: "upcoming", title: "Upcoming" },
  { bucket: "past", title: "Past" },
];

export function MealPlanPortal({ initialItems, initialHasMore }: MealPlanPortalProps) {
  const [items, setItems] = useState<MealPlanListItem[]>(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const { showToast } = useToast();

  const loadPage = useCallback(
    async (offset: number) => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/meal-plans?offset=${offset}&limit=${MEAL_PLAN_LIST_PAGE_SIZE}`,
          { cache: "no-store" }
        );
        if (!response.ok) {
          throw new Error(`Failed to load meal plans (${response.status})`);
        }
        const page: { items: MealPlanListItem[]; has_more: boolean } = await response.json();
        setItems((current) => [...current, ...page.items]);
        setHasMore(page.has_more);
      } catch {
        showToast("Couldn't load meal plans. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

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
          loadPage(items.length);
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-observe only when the page/count actually changes
  }, [hasMore, loading, items.length]);

  const buckets = useMemo(() => {
    const today = localDateString();
    const grouped: Record<MealPlanBucket, MealPlanListItem[]> = {
      current: [],
      upcoming: [],
      past: [],
    };
    for (const item of items) {
      grouped[bucketForMealPlan(item, today)].push(item);
    }
    return grouped;
  }, [items]);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold text-stone-900">Meal Plans</h1>
        <Link
          href="/meal-plans/new"
          aria-label="Create meal plan"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-600 text-white shadow-sm transition-colors hover:bg-orange-700"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
            <path d="M10 4a1 1 0 0 1 1 1v4h4a1 1 0 1 1 0 2h-4v4a1 1 0 1 1-2 0v-4H5a1 1 0 1 1 0-2h4V5a1 1 0 0 1 1-1Z" />
          </svg>
        </Link>
      </div>

      {items.length === 0 && !loading ? (
        <div className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center">
          <p className="text-sm text-stone-600">
            You don&apos;t have any meal plans yet. Create one to get started.
          </p>
        </div>
      ) : (
        BUCKET_SECTIONS.map(({ bucket, title }) =>
          buckets[bucket].length > 0 ? (
            <section key={bucket} className="mt-6">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                {title}
              </h2>
              <ul className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {buckets[bucket].map((mealPlan) => (
                  <li key={mealPlan.id}>
                    <MealPlanCard mealPlan={mealPlan} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null
        )
      )}

      <div ref={sentinelRef} className="h-1" />
      {loading && <p className="mt-6 text-center text-sm text-stone-500">Loading…</p>}
    </div>
  );
}
