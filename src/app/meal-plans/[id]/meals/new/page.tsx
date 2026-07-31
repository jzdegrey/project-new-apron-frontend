import { notFound, redirect } from "next/navigation";
import { backendGetCurrentUser, backendGetMealPlan } from "@/lib/backendClient";
import { getSessionToken } from "@/lib/session";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MealForm } from "@/components/mealPlans/MealForm";

interface NewMealPageProps {
  params: Promise<{ id: string }>;
}

export default async function NewMealPage({ params }: NewMealPageProps) {
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
      <Navbar isSignedIn />
      <main className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-3xl px-6 py-10">
          <h1 className="font-display text-3xl font-semibold text-stone-900">Add Meal</h1>
          <p className="mt-1 text-sm text-stone-600">{mealPlan.name}</p>
          <div className="mt-6">
            <MealForm
              mealPlanId={mealPlan.id}
              planStartDate={mealPlan.start_date}
              planEndDate={mealPlan.end_date}
              existingMeals={mealPlan.meals}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
