import Link from "next/link";
import type { MealPlanListItem } from "@/lib/mealPlans";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

function formatDateRange(startDate: string, endDate: string): string {
  return `${dateFormatter.format(new Date(`${startDate}T00:00:00Z`))} – ${dateFormatter.format(
    new Date(`${endDate}T00:00:00Z`)
  )}`;
}

export function MealPlanCard({ mealPlan }: { mealPlan: MealPlanListItem }) {
  return (
    <Link
      href={`/meal-plans/${mealPlan.id}`}
      className="flex flex-col gap-1 rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition-colors hover:border-orange-300"
    >
      <h3 className="font-medium text-stone-900">{mealPlan.name}</h3>
      {mealPlan.description && (
        <p className="line-clamp-2 text-sm text-stone-600">{mealPlan.description}</p>
      )}
      <p className="mt-1 text-sm text-stone-600">
        {formatDateRange(mealPlan.start_date, mealPlan.end_date)}
      </p>
      <p className="text-xs text-stone-500">
        {mealPlan.meal_count} {mealPlan.meal_count === 1 ? "meal" : "meals"}
      </p>
    </Link>
  );
}
