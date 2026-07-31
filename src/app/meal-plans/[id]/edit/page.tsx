import { notFound, redirect } from "next/navigation";
import { backendGetCurrentUser, backendGetMealPlan } from "@/lib/backendClient";
import { getSessionToken } from "@/lib/session";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MealPlanForm } from "@/components/mealPlans/MealPlanForm";

interface EditMealPlanPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditMealPlanPage({ params }: EditMealPlanPageProps) {
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
          <h1 className="font-display text-3xl font-semibold text-stone-900">Edit Meal Plan</h1>
          <div className="mt-6">
            <MealPlanForm mode="edit" mealPlanId={mealPlan.id} initialMealPlan={mealPlan} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
