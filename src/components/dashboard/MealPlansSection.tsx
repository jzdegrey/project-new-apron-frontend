import Link from "next/link";
import type { MealPlan } from "@/lib/dashboardData";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatDateRange(startDate: string, endDate: string): string {
  return `${dateFormatter.format(new Date(startDate))} – ${dateFormatter.format(new Date(endDate))}`;
}

export function MealPlansSection({ mealPlans }: { mealPlans: MealPlan[] }) {
  const active = mealPlans.find((plan) => plan.status === "active");
  const others = [
    ...mealPlans.filter((plan) => plan.status === "upcoming"),
    ...mealPlans.filter((plan) => plan.status === "past"),
  ];

  return (
    <section aria-labelledby="meal-plans-heading" className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <h2 id="meal-plans-heading" className="font-display text-2xl font-semibold text-stone-900">
          Meal Plans
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
            {formatDateRange(active.startDate, active.endDate)}
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
              <Link
                href={`/meal-plans/${plan.id}`}
                className="block rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition-colors hover:border-orange-300"
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                  {plan.status === "upcoming" ? "Upcoming" : "Past"}
                </span>
                <h4 className="mt-1 font-medium text-stone-900">{plan.name}</h4>
                <p className="mt-1 text-sm text-stone-600">
                  {formatDateRange(plan.startDate, plan.endDate)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
