import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { backendGetCurrentUser, backendGetMealPlan } from "@/lib/backendClient";
import { getSessionToken } from "@/lib/session";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MealDetailView } from "@/components/mealPlans/MealDetailView";

interface MealViewPageProps {
  params: Promise<{ id: string; mealId: string }>;
}

export default async function MealViewPage({ params }: MealViewPageProps) {
  const token = await getSessionToken();
  const user = token ? await backendGetCurrentUser(token) : null;
  if (!user || !token) {
    redirect("/sign-in");
  }

  const { id, mealId } = await params;
  const mealPlanId = Number(id);
  const parsedMealId = Number(mealId);
  if (!Number.isInteger(mealPlanId) || !Number.isInteger(parsedMealId)) {
    notFound();
  }

  const mealPlan = await backendGetMealPlan(token, mealPlanId);
  if (!mealPlan) {
    notFound();
  }
  const meal = mealPlan.meals.find((m) => m.id === parsedMealId);
  if (!meal) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-stone-50">
      <Navbar isSignedIn />
      <main className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-3xl px-6 py-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Link
                href={`/meal-plans/${mealPlan.id}`}
                className="text-sm font-medium text-orange-600 hover:text-orange-700"
              >
                &larr; {mealPlan.name}
              </Link>
              <h1 className="mt-1 font-display text-3xl font-semibold text-stone-900">Meal</h1>
            </div>
            <Link
              href={`/meal-plans/${mealPlan.id}/meals/${meal.id}/edit`}
              aria-label="Edit meal"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-600 shadow-sm transition-colors hover:bg-stone-50"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                <path d="M13.586 3.586a2 2 0 1 1 2.828 2.828l-8.5 8.5a2 2 0 0 1-.878.507l-3 .857a.5.5 0 0 1-.618-.618l.857-3a2 2 0 0 1 .507-.878l8.5-8.5Z" />
              </svg>
            </Link>
          </div>

          <div className="mt-6">
            <MealDetailView mealPlanId={mealPlan.id} initialMeal={meal} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
