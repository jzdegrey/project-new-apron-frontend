import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { backendGetCurrentUser, backendGetMealPlan } from "@/lib/backendClient";
import { MEAL_TYPE_LABELS } from "@/lib/mealPlans";
import { getSessionToken } from "@/lib/session";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const timestampFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDateRange(startDate: string, endDate: string): string {
  return `${dateFormatter.format(new Date(`${startDate}T00:00:00Z`))} – ${dateFormatter.format(
    new Date(`${endDate}T00:00:00Z`)
  )}`;
}

function formatDay(day: string): string {
  return dateFormatter.format(new Date(`${day}T00:00:00Z`));
}

interface MealPlanViewPageProps {
  params: Promise<{ id: string }>;
}

export default async function MealPlanViewPage({ params }: MealPlanViewPageProps) {
  const token = await getSessionToken();
  const user = token ? await backendGetCurrentUser(token) : null;
  if (!user || !token) {
    redirect("/sign-in");
  }

  const mealPlanId = Number((await params).id);
  if (!Number.isInteger(mealPlanId)) {
    notFound();
  }

  const mealPlan = await backendGetMealPlan(token, mealPlanId);
  if (!mealPlan) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-stone-50">
      <Navbar />
      <main className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-3xl px-6 py-10">
          <div className="flex items-start justify-between gap-4">
            <h1 className="font-display text-3xl font-semibold text-stone-900">{mealPlan.name}</h1>
            <Link
              href={`/meal-plans/${mealPlan.id}/edit`}
              aria-label="Edit meal plan"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-600 shadow-sm transition-colors hover:bg-stone-50"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                <path d="M13.586 3.586a2 2 0 1 1 2.828 2.828l-8.5 8.5a2 2 0 0 1-.878.507l-3 .857a.5.5 0 0 1-.618-.618l.857-3a2 2 0 0 1 .507-.878l8.5-8.5Z" />
              </svg>
            </Link>
          </div>

          <p className="mt-2 text-stone-600">{formatDateRange(mealPlan.start_date, mealPlan.end_date)}</p>
          {mealPlan.description && <p className="mt-4 text-stone-700">{mealPlan.description}</p>}

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-stone-400">
            <span>Created {timestampFormatter.format(new Date(mealPlan.created_at))}</span>
            <span>Modified {timestampFormatter.format(new Date(mealPlan.updated_at))}</span>
          </div>

          <div className="mt-8 flex items-center justify-between gap-4">
            <h2 className="font-display text-xl font-semibold text-stone-900">Meals</h2>
            <Link
              href={`/meal-plans/${mealPlan.id}/meals/new`}
              className="rounded-full bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-700"
            >
              Add Meal
            </Link>
          </div>

          {mealPlan.meals.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center">
              <p className="text-sm text-stone-600">
                No meals yet. Add your first meal to get started.
              </p>
            </div>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {mealPlan.meals.map((meal) => (
                <li key={meal.id}>
                  <Link
                    href={`/meal-plans/${mealPlan.id}/meals/${meal.id}`}
                    className="flex flex-col gap-1 rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition-colors hover:border-orange-300 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wide text-orange-700">
                        {MEAL_TYPE_LABELS[meal.meal_type]}
                      </span>
                      <p className="mt-0.5 text-sm text-stone-600">{formatDay(meal.day)}</p>
                    </div>
                    <p className="text-sm text-stone-600">
                      {meal.recipes.length === 0
                        ? "No recipes yet"
                        : meal.recipes.map((recipe) => recipe.name).join(", ")}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
