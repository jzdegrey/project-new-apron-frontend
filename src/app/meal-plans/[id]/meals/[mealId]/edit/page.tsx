import { notFound, redirect } from "next/navigation";
import { backendGetCurrentUser, backendGetMealPlan } from "@/lib/backendClient";
import { getSessionToken } from "@/lib/session";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MealEditForm } from "@/components/mealPlans/MealEditForm";

interface EditMealPageProps {
  params: Promise<{ id: string; mealId: string }>;
}

export default async function EditMealPage({ params }: EditMealPageProps) {
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
          <h1 className="font-display text-3xl font-semibold text-stone-900">Edit Meal</h1>
          <div className="mt-6">
            <MealEditForm
              mealPlanId={mealPlan.id}
              planStartDate={mealPlan.start_date}
              planEndDate={mealPlan.end_date}
              meal={meal}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
