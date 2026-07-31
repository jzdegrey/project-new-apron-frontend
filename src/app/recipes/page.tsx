import { redirect } from "next/navigation";
import { backendGetCurrentUser, backendListRecipes } from "@/lib/backendClient";
import { DEFAULT_RECIPE_SORT_ORDER, RECIPE_LIST_PAGE_SIZE } from "@/lib/recipes";
import { getSessionToken } from "@/lib/session";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { RecipePortal } from "@/components/recipes/RecipePortal";

export default async function RecipesPage() {
  const token = await getSessionToken();
  const user = token ? await backendGetCurrentUser(token) : null;

  if (!user || !token) {
    redirect("/sign-in");
  }

  const page = await backendListRecipes(token, {
    sort: DEFAULT_RECIPE_SORT_ORDER,
    offset: 0,
    limit: RECIPE_LIST_PAGE_SIZE,
  });

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-stone-50">
      <Navbar />
      <main className="flex flex-1 flex-col">
        <RecipePortal initialItems={page.items} initialHasMore={page.has_more} />
      </main>
      <Footer />
    </div>
  );
}
