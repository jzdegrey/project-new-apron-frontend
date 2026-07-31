import Link from "next/link";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import type { RecipeListItem } from "@/lib/recipes";

export function RecipesSection({ recipes }: { recipes: RecipeListItem[] }) {
  return (
    <section aria-labelledby="recipes-heading" className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 id="recipes-heading" className="font-display text-2xl font-semibold text-stone-900">
          <Link href="/recipes" className="transition-colors hover:text-orange-700">
            Recipes
          </Link>
        </h2>
        <div className="flex items-center gap-3">
          <Link
            href="/recipes"
            className="text-sm font-medium text-orange-600 hover:text-orange-700"
          >
            View all recipes
          </Link>
          <Link
            href="/recipes/new"
            className="rounded-full bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-700"
          >
            Add Recipe
          </Link>
        </div>
      </div>

      {recipes.length > 0 ? (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <li key={recipe.id}>
              <RecipeCard recipe={recipe} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center">
          <p className="text-sm text-stone-600">
            You haven&apos;t saved any recipes yet. Add one to get started.
          </p>
        </div>
      )}
    </section>
  );
}
