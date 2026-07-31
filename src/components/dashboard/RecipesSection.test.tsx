/** @jest-environment jsdom */

import { render, screen } from "@testing-library/react";
import { RecipesSection } from "./RecipesSection";
import type { RecipeListItem } from "@/lib/recipes";

const RECIPES: RecipeListItem[] = [
  {
    id: 1,
    name: "Recently Added Recipe",
    description: null,
    image_url: null,
    last_used_in_meal_plan: null,
  },
  {
    id: 2,
    name: "Recently Used Recipe",
    description: null,
    image_url: null,
    last_used_in_meal_plan: "This Week",
  },
];

describe("RecipesSection", () => {
  it("shows an empty state and an Add Recipe link when there are no recipes", () => {
    render(<RecipesSection recipes={[]} />);

    expect(
      screen.getByText("You haven't saved any recipes yet. Add one to get started.")
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Add Recipe" })).toHaveAttribute(
      "href",
      "/recipes/new"
    );
  });

  it("renders each recipe linking to its detail page", () => {
    render(<RecipesSection recipes={RECIPES} />);

    const titles = screen.getAllByRole("heading", { level: 3 }).map((el) => el.textContent);
    expect(titles).toEqual(["Recently Added Recipe", "Recently Used Recipe"]);
    expect(screen.getByRole("link", { name: "Recently Added Recipe" })).toHaveAttribute(
      "href",
      "/recipes/1"
    );
  });

  it("links the Recipes heading to the recipes portal", () => {
    render(<RecipesSection recipes={[]} />);

    expect(screen.getByRole("link", { name: "Recipes" })).toHaveAttribute("href", "/recipes");
  });
});
