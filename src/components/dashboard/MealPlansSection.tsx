import Link from "next/link";
import { MealPlanCard } from "@/components/mealPlans/MealPlanCard";
import { bucketForMealPlan, localDateString, type MealPlanListItem } from "@/lib/mealPlans";

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

export function MealPlansSection({ mealPlans }: { mealPlans: MealPlanListItem[] }) {
  const today = localDateString();
  const current = mealPlans.filter((plan) => bucketForMealPlan(plan, today) === "current");
  const active = current[0] ?? null;
  const others = [
    ...current.slice(1),
    ...mealPlans.filter((plan) => bucketForMealPlan(plan, today) === "upcoming"),
    ...mealPlans.filter((plan) => bucketForMealPlan(plan, today) === "past"),
  ];

  return (
    <section aria-labelledby="meal-plans-heading" className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <h2 id="meal-plans-heading" className="font-display text-2xl font-semibold text-stone-900">
          <Link href="/meal-plans" className="transition-colors hover:text-orange-700">
            Meal Plans
          </Link>
        </h2>
        <div className="flex items-center gap-3">
          <Link
            href="/meal-plans"
            className="text-sm font-medium text-orange-600 hover:text-orange-700"
          >
            View all meal plans
          </Link>
          <Link
            href="/meal-plans/new"
            className="rounded-full bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-700"
          >
            Add Meal Plan
          </Link>
        </div>
      </div>

      {active ? (
        <Link
          href={`/meal-plans/${active.id}`}
          className="mt-6 block rounded-2xl border border-orange-200 bg-orange-50 p-6 shadow-sm transition-colors hover:border-orange-300 sm:p-8"
        >
          <span className="text-xs font-semibold uppercase tracking-wide text-orange-700">
            Active Meal Plan
          </span>
          <h3 className="mt-2 font-display text-xl font-semibold text-stone-900">{active.name}</h3>
          <p className="mt-1 text-sm text-stone-600">
            {formatDateRange(active.start_date, active.end_date)}
          </p>
        </Link>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center">
          <p className="text-sm text-stone-600">
            You don&apos;t have an active meal plan yet. Create one to get started.
          </p>
        </div>
      )}

      {others.length > 0 && (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((plan) => (
            <li key={plan.id}>
              <MealPlanCard mealPlan={plan} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
