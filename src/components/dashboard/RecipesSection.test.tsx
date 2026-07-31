/** @jest-environment jsdom */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RecipesSection } from "./RecipesSection";
import type { Recipe } from "@/lib/dashboardData";

// addedAt, lastUsedAt, and usageCount are each ordered differently across these
// three recipes so every sort option produces a distinguishable result.
const RECIPES: Recipe[] = [
  {
    id: "1",
    title: "Recently Added Recipe",
    addedAt: "2026-07-25T00:00:00Z",
    lastUsedAt: "2026-01-01T00:00:00Z",
    usageCount: 1,
  },
  {
    id: "2",
    title: "Recently Used Recipe",
    addedAt: "2026-07-15T00:00:00Z",
    lastUsedAt: "2026-07-20T00:00:00Z",
    usageCount: 5,
  },
  {
    id: "3",
    title: "Most Used Recipe",
    addedAt: "2026-07-01T00:00:00Z",
    lastUsedAt: "2026-06-01T00:00:00Z",
    usageCount: 9,
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

  it("defaults to sorting by recently added and links each recipe to its detail page", () => {
    render(<RecipesSection recipes={RECIPES} />);

    expect(screen.getByLabelText("Sort by")).toHaveValue("recently_added");
    const titles = screen.getAllByRole("heading", { level: 3 }).map((el) => el.textContent);
    expect(titles).toEqual([
      "Recently Added Recipe",
      "Recently Used Recipe",
      "Most Used Recipe",
    ]);
    expect(screen.getByRole("link", { name: "Recently Added Recipe" })).toHaveAttribute(
      "href",
      "/recipes/1"
    );
  });

  it("re-sorts recipes by most often used when selected", async () => {
    const user = userEvent.setup();
    render(<RecipesSection recipes={RECIPES} />);

    await user.selectOptions(screen.getByLabelText("Sort by"), "Most often used");

    const titles = screen.getAllByRole("heading", { level: 3 }).map((el) => el.textContent);
    expect(titles).toEqual([
      "Most Used Recipe",
      "Recently Used Recipe",
      "Recently Added Recipe",
    ]);
  });

  it("re-sorts recipes by recently used when selected", async () => {
    const user = userEvent.setup();
    render(<RecipesSection recipes={RECIPES} />);

    await user.selectOptions(screen.getByLabelText("Sort by"), "Recently used");

    const titles = screen.getAllByRole("heading", { level: 3 }).map((el) => el.textContent);
    expect(titles).toEqual([
      "Recently Used Recipe",
      "Most Used Recipe",
      "Recently Added Recipe",
    ]);
  });
});
