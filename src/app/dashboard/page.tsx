import { redirect } from "next/navigation";
import {
  backendGetCurrentUser,
  backendListMealPlans,
  backendListRecipes,
} from "@/lib/backendClient";
import { MEAL_PLAN_LIST_PAGE_SIZE } from "@/lib/mealPlans";
import { DEFAULT_RECIPE_SORT_ORDER, RECIPE_LIST_PAGE_SIZE } from "@/lib/recipes";
import { getSessionToken } from "@/lib/session";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MealPlansSection } from "@/components/dashboard/MealPlansSection";
import { RecipesSection } from "@/components/dashboard/RecipesSection";

export default async function DashboardPage() {
  const token = await getSessionToken();
  const user = token ? await backendGetCurrentUser(token) : null;

  if (!user || !token) {
    redirect("/sign-in");
  }

  const [mealPlanPage, recipePage] = await Promise.all([
    backendListMealPlans(token, { offset: 0, limit: MEAL_PLAN_LIST_PAGE_SIZE }),
    backendListRecipes(token, {
      sort: DEFAULT_RECIPE_SORT_ORDER,
      offset: 0,
      limit: RECIPE_LIST_PAGE_SIZE,
    }),
  ]);

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-stone-50">
      <Navbar isSignedIn />
      <main className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-6xl px-6 pt-10">
          <h1 className="font-display text-3xl font-semibold text-stone-900">
            Welcome back, {user.first_name}
          </h1>
        </div>
        <MealPlansSection mealPlans={mealPlanPage.items} />
        <RecipesSection recipes={recipePage.items} />
      </main>
      <Footer />
    </div>
  );
}
