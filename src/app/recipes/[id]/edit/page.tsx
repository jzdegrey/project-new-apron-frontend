import { notFound, redirect } from "next/navigation";
import { backendGetCurrentUser, backendGetRecipe } from "@/lib/backendClient";
import { getSessionToken } from "@/lib/session";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { RecipeForm } from "@/components/recipes/RecipeForm";

interface EditRecipePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditRecipePage({ params }: EditRecipePageProps) {
  const token = await getSessionToken();
  const user = token ? await backendGetCurrentUser(token) : null;
  if (!user || !token) {
    redirect("/sign-in");
  }

  const recipeId = Number((await params).id);
  if (!Number.isInteger(recipeId)) {
    notFound();
  }

  const recipe = await backendGetRecipe(token, recipeId);
  if (!recipe) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-stone-50">
      <Navbar />
      <main className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-3xl px-6 py-10">
          <h1 className="font-display text-3xl font-semibold text-stone-900">Edit Recipe</h1>
          <div className="mt-6">
            <RecipeForm mode="edit" recipeId={recipe.id} initialRecipe={recipe} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
