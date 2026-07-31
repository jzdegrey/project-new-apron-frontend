/** @jest-environment jsdom */

import { render, screen } from "@testing-library/react";
import { MealPlansSection } from "./MealPlansSection";
import { addDaysToDateString, localDateString, type MealPlanListItem } from "@/lib/mealPlans";

const today = localDateString();

const ACTIVE: MealPlanListItem = {
  id: 1,
  name: "This Week",
  description: null,
  start_date: addDaysToDateString(today, -2),
  end_date: addDaysToDateString(today, 4),
  meal_count: 3,
};
const UPCOMING: MealPlanListItem = {
  id: 2,
  name: "Next Week",
  description: null,
  start_date: addDaysToDateString(today, 5),
  end_date: addDaysToDateString(today, 11),
  meal_count: 0,
};
const PAST: MealPlanListItem = {
  id: 3,
  name: "Last Week",
  description: null,
  start_date: addDaysToDateString(today, -9),
  end_date: addDaysToDateString(today, -3),
  meal_count: 2,
};

describe("MealPlansSection", () => {
  it("shows an empty state and an Add Meal Plan link when there are no meal plans", () => {
    render(<MealPlansSection mealPlans={[]} />);

    expect(
      screen.getByText("You don't have an active meal plan yet. Create one to get started.")
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Add Meal Plan" })).toHaveAttribute(
      "href",
      "/meal-plans/new"
    );
  });

  it("renders the active meal plan as the primary card linking to its detail page", () => {
    render(<MealPlansSection mealPlans={[ACTIVE]} />);

    expect(screen.getByText("Active Meal Plan")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /This Week/ })).toHaveAttribute(
      "href",
      "/meal-plans/1"
    );
  });

  it("lists upcoming plans before past plans", () => {
    render(<MealPlansSection mealPlans={[PAST, ACTIVE, UPCOMING]} />);

    const items = screen.getAllByRole("listitem").map((item) => item.textContent);
    expect(items[0]).toContain("Next Week");
    expect(items[1]).toContain("Last Week");
  });

  it("links the Meal Plans heading to the meal plans portal", () => {
    render(<MealPlansSection mealPlans={[]} />);

    expect(screen.getByRole("link", { name: "Meal Plans" })).toHaveAttribute(
      "href",
      "/meal-plans"
    );
  });
});
