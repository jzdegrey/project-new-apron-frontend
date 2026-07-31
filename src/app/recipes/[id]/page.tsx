import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { backendGetCurrentUser, backendGetRecipe } from "@/lib/backendClient";
import { formatQuantity } from "@/lib/fraction";
import { INGREDIENT_UNIT_LABELS } from "@/lib/units";
import { getSessionToken } from "@/lib/session";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DirectionText } from "@/components/recipes/DirectionText";

interface RecipeViewPageProps {
  params: Promise<{ id: string }>;
}

export default async function RecipeViewPage({ params }: RecipeViewPageProps) {
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

  const ingredientDetails = recipe.ingredients.map((ingredient) => ({
    name: ingredient.name,
    quantity: Number(ingredient.quantity),
    unit: ingredient.unit,
  }));

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-stone-50">
      <Navbar isSignedIn />
      <main className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-3xl px-6 py-10">
          <div className="flex items-start justify-between gap-4">
            <h1 className="font-display text-3xl font-semibold text-stone-900">{recipe.name}</h1>
            <Link
              href={`/recipes/${recipe.id}/edit`}
              aria-label="Edit recipe"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-600 shadow-sm transition-colors hover:bg-stone-50"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                <path d="M13.586 3.586a2 2 0 1 1 2.828 2.828l-8.5 8.5a2 2 0 0 1-.878.507l-3 .857a.5.5 0 0 1-.618-.618l.857-3a2 2 0 0 1 .507-.878l8.5-8.5Z" />
              </svg>
            </Link>
          </div>

          {recipe.image_url && (
            // eslint-disable-next-line @next/next/no-img-element -- user-uploaded photo, arbitrary source
            <img
              src={recipe.image_url}
              alt={recipe.name}
              className="mt-4 h-64 w-full rounded-xl object-cover"
            />
          )}

          {recipe.description && <p className="mt-4 text-stone-700">{recipe.description}</p>}

          {recipe.last_used_in_meal_plan && (
            <p className="mt-2 text-sm font-medium text-orange-700">
              Used in {recipe.last_used_in_meal_plan}
            </p>
          )}

          <section className="mt-8">
            <h2 className="font-display text-xl font-semibold text-stone-900">Ingredients</h2>
            <ul className="mt-3 flex flex-col gap-1.5">
              {recipe.ingredients.map((ingredient) => (
                <li key={ingredient.id} className="text-stone-700">
                  {formatQuantity(Number(ingredient.quantity))} {INGREDIENT_UNIT_LABELS[ingredient.unit]}{" "}
                  {ingredient.name}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="font-display text-xl font-semibold text-stone-900">Directions</h2>
            <ol className="mt-3 flex flex-col gap-3">
              {recipe.directions.map((direction, index) => (
                <li key={direction.id} className="flex gap-3 text-stone-700">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-200 text-xs font-semibold text-stone-700">
                    {index + 1}
                  </span>
                  <DirectionText text={direction.step_text} ingredients={ingredientDetails} />
                </li>
              ))}
            </ol>
          </section>

          {recipe.notes && (
            <section className="mt-8">
              <h2 className="font-display text-xl font-semibold text-stone-900">Notes</h2>
              <p className="mt-3 whitespace-pre-wrap text-stone-700">{recipe.notes}</p>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
