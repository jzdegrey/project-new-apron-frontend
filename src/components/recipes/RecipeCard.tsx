import Link from "next/link";
import type { RecipeListItem } from "@/lib/recipes";

export function RecipeCard({ recipe }: { recipe: RecipeListItem }) {
  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className="flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition-colors hover:border-orange-300"
    >
      {recipe.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element -- recipe photos are user-uploaded, arbitrary sizes
        <img
          src={recipe.image_url}
          alt=""
          className="h-36 w-full object-cover"
        />
      ) : null}
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="font-medium text-stone-900">{recipe.name}</h3>
        {recipe.description && (
          <p className="line-clamp-2 text-sm text-stone-600">{recipe.description}</p>
        )}
        {recipe.last_used_in_meal_plan && (
          <p className="mt-1 text-xs font-medium text-orange-700">
            Used in {recipe.last_used_in_meal_plan}
          </p>
        )}
      </div>
    </Link>
  );
}
