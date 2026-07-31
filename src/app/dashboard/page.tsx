import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { backendGetCurrentUser } from "@/lib/backendClient";
import { getMealPlans, getRecipes } from "@/lib/dashboardData";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MealPlansSection } from "@/components/dashboard/MealPlansSection";
import { RecipesSection } from "@/components/dashboard/RecipesSection";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const user = token ? await backendGetCurrentUser(token) : null;

  if (!user) {
    redirect("/sign-in");
  }

  const [mealPlans, recipes] = await Promise.all([getMealPlans(), getRecipes()]);

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-stone-50">
      <Navbar />
      <main className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-6xl px-6 pt-10">
          <h1 className="font-display text-3xl font-semibold text-stone-900">
            Welcome back, {user.first_name}
          </h1>
        </div>
        <MealPlansSection mealPlans={mealPlans} />
        <RecipesSection recipes={recipes} />
      </main>
      <Footer />
    </div>
  );
}
