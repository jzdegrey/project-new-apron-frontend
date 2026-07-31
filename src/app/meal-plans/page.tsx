import { redirect } from "next/navigation";
import { backendGetCurrentUser, backendListMealPlans } from "@/lib/backendClient";
import { MEAL_PLAN_LIST_PAGE_SIZE } from "@/lib/mealPlans";
import { getSessionToken } from "@/lib/session";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MealPlanPortal } from "@/components/mealPlans/MealPlanPortal";

export default async function MealPlansPage() {
  const token = await getSessionToken();
  const user = token ? await backendGetCurrentUser(token) : null;

  if (!user || !token) {
    redirect("/sign-in");
  }

  const page = await backendListMealPlans(token, { offset: 0, limit: MEAL_PLAN_LIST_PAGE_SIZE });

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-stone-50">
      <Navbar isSignedIn />
      <main className="flex flex-1 flex-col">
        <MealPlanPortal initialItems={page.items} initialHasMore={page.has_more} />
      </main>
      <Footer />
    </div>
  );
}
