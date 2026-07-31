/** @jest-environment jsdom */

import { render, screen } from "@testing-library/react";
import { MealPlansSection } from "./MealPlansSection";
import type { MealPlan } from "@/lib/dashboardData";

const ACTIVE: MealPlan = {
  id: "1",
  name: "This Week",
  startDate: "2026-07-27",
  endDate: "2026-08-02",
  status: "active",
};
const UPCOMING: MealPlan = {
  id: "2",
  name: "Next Week",
  startDate: "2026-08-03",
  endDate: "2026-08-09",
  status: "upcoming",
};
const PAST: MealPlan = {
  id: "3",
  name: "Last Week",
  startDate: "2026-07-20",
  endDate: "2026-07-26",
  status: "past",
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
});
