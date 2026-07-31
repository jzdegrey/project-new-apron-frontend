import {
  addDaysToDateString,
  bucketForMealPlan,
  defaultDayForNewMeal,
  defaultMealTypeForDay,
} from "./mealPlans";

describe("bucketForMealPlan", () => {
  it("buckets a plan covering today as current", () => {
    const bucket = bucketForMealPlan(
      { start_date: "2026-01-01", end_date: "2026-01-10" },
      "2026-01-05"
    );
    expect(bucket).toBe("current");
  });

  it("buckets a single-day plan starting today as current", () => {
    expect(
      bucketForMealPlan({ start_date: "2026-01-05", end_date: "2026-01-05" }, "2026-01-05")
    ).toBe("current");
  });

  it("buckets a plan starting after today as upcoming", () => {
    expect(
      bucketForMealPlan({ start_date: "2026-01-06", end_date: "2026-01-10" }, "2026-01-05")
    ).toBe("upcoming");
  });

  it("buckets a plan that ended before today as past", () => {
    expect(
      bucketForMealPlan({ start_date: "2026-01-01", end_date: "2026-01-04" }, "2026-01-05")
    ).toBe("past");
  });
});

describe("addDaysToDateString", () => {
  it("adds days within a month", () => {
    expect(addDaysToDateString("2026-01-01", 1)).toBe("2026-01-02");
  });

  it("rolls over month boundaries", () => {
    expect(addDaysToDateString("2026-01-31", 1)).toBe("2026-02-01");
  });
});

describe("defaultDayForNewMeal", () => {
  it("defaults to the plan start date when there are no meals yet", () => {
    expect(defaultDayForNewMeal([], "2026-01-01", "2026-01-07")).toBe("2026-01-01");
  });

  it("advances to the next day once breakfast/lunch/dinner are all filled", () => {
    const meals = [
      { meal_type: "breakfast" as const, day: "2026-01-01" },
      { meal_type: "lunch" as const, day: "2026-01-01" },
      { meal_type: "dinner" as const, day: "2026-01-01" },
    ];
    expect(defaultDayForNewMeal(meals, "2026-01-01", "2026-01-07")).toBe("2026-01-02");
  });

  it("stays on the same day if only some core meals are filled", () => {
    const meals = [{ meal_type: "breakfast" as const, day: "2026-01-01" }];
    expect(defaultDayForNewMeal(meals, "2026-01-01", "2026-01-07")).toBe("2026-01-01");
  });

  it("does not advance for non-core meals like dessert", () => {
    const meals = [{ meal_type: "dessert" as const, day: "2026-01-01" }];
    expect(defaultDayForNewMeal(meals, "2026-01-01", "2026-01-07")).toBe("2026-01-01");
  });

  it("falls back to the plan end date once every day is fully core-filled", () => {
    const meals = ["breakfast", "lunch", "dinner"].map((meal_type) => ({
      meal_type: meal_type as "breakfast" | "lunch" | "dinner",
      day: "2026-01-01",
    }));
    expect(defaultDayForNewMeal(meals, "2026-01-01", "2026-01-01")).toBe("2026-01-01");
  });
});

describe("defaultMealTypeForDay", () => {
  it("suggests breakfast first when the day is empty", () => {
    expect(defaultMealTypeForDay([], "2026-01-01")).toBe("breakfast");
  });

  it("suggests lunch once breakfast is taken", () => {
    const meals = [{ meal_type: "breakfast" as const, day: "2026-01-01" }];
    expect(defaultMealTypeForDay(meals, "2026-01-01")).toBe("lunch");
  });

  it("suggests dinner once breakfast and lunch are taken", () => {
    const meals = [
      { meal_type: "breakfast" as const, day: "2026-01-01" },
      { meal_type: "lunch" as const, day: "2026-01-01" },
    ];
    expect(defaultMealTypeForDay(meals, "2026-01-01")).toBe("dinner");
  });

  it("suggests dessert, then snack, then brunch after the core meals are taken", () => {
    const core = ["breakfast", "lunch", "dinner"].map((meal_type) => ({
      meal_type: meal_type as "breakfast" | "lunch" | "dinner",
      day: "2026-01-01",
    }));
    expect(defaultMealTypeForDay(core, "2026-01-01")).toBe("dessert");
    expect(defaultMealTypeForDay([...core, { meal_type: "dessert", day: "2026-01-01" }], "2026-01-01")).toBe(
      "snack"
    );
    expect(
      defaultMealTypeForDay(
        [...core, { meal_type: "dessert", day: "2026-01-01" }, { meal_type: "snack", day: "2026-01-01" }],
        "2026-01-01"
      )
    ).toBe("brunch");
  });

  it("ignores meals on other days", () => {
    const meals = [{ meal_type: "breakfast" as const, day: "2026-01-02" }];
    expect(defaultMealTypeForDay(meals, "2026-01-01")).toBe("breakfast");
  });
});
