import { matchIngredientSegments } from "./ingredientMatch";

describe("matchIngredientSegments", () => {
  it("returns the whole text unmatched when there are no ingredient names", () => {
    expect(matchIngredientSegments("Add in the vanilla", [])).toEqual([
      { text: "Add in the vanilla", ingredientIndex: null },
    ]);
  });

  it("matches a single ingredient by name, case-insensitively", () => {
    const segments = matchIngredientSegments("Add in the Vanilla now", ["vanilla"]);
    expect(segments).toEqual([
      { text: "Add in the ", ingredientIndex: null },
      { text: "Vanilla", ingredientIndex: 0 },
      { text: " now", ingredientIndex: null },
    ]);
  });

  it("does not match a substring inside another word", () => {
    const segments = matchIngredientSegments("Vanillaish flavor", ["vanilla"]);
    expect(segments.every((segment) => segment.ingredientIndex === null)).toBe(true);
  });

  it("prefers the longer ingredient name when one contains another", () => {
    const segments = matchIngredientSegments("Add brown sugar to taste", ["sugar", "brown sugar"]);
    const matched = segments.find((segment) => segment.ingredientIndex !== null);
    expect(matched?.text).toBe("brown sugar");
    expect(matched?.ingredientIndex).toBe(1);
  });

  it("matches multiple distinct ingredients", () => {
    const segments = matchIngredientSegments("Mix flour and sugar together", ["flour", "sugar"]);
    const matchedTexts = segments.filter((s) => s.ingredientIndex !== null).map((s) => s.text);
    expect(matchedTexts).toEqual(["flour", "sugar"]);
  });

  it("ignores blank ingredient names", () => {
    const segments = matchIngredientSegments("Add salt", ["", "salt"]);
    const matched = segments.find((segment) => segment.ingredientIndex !== null);
    expect(matched?.ingredientIndex).toBe(1);
  });
});
