/** @jest-environment jsdom */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RecipeForm } from "./RecipeForm";
import { ToastProvider } from "@/components/Toast";
import type { Recipe } from "@/lib/recipes";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

function renderForm(props: React.ComponentProps<typeof RecipeForm>) {
  return render(
    <ToastProvider>
      <RecipeForm {...props} />
    </ToastProvider>
  );
}

const EXISTING_RECIPE: Recipe = {
  id: 1,
  name: "Pancakes",
  description: "Fluffy breakfast pancakes.",
  notes: null,
  image_url: null,
  ingredients: [{ id: 1, quantity: "2", unit: "tsp", name: "vanilla", cost: "0.00" }],
  directions: [{ id: 1, step_text: "Mix and cook." }],
  last_used_in_meal_plan: null,
};

beforeEach(() => {
  pushMock.mockReset();
  global.fetch = jest.fn();
});

describe("RecipeForm - create mode", () => {
  it("renders required fields with a single blank ingredient and step row", () => {
    renderForm({ mode: "create" });

    expect(screen.getByLabelText("Recipe Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Ingredient 1 name")).toBeInTheDocument();
    expect(screen.getByLabelText("Direction step 1")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Delete Recipe" })).not.toBeInTheDocument();
  });

  it("blocks submission and shows an error when the name is empty", async () => {
    const user = userEvent.setup();
    renderForm({ mode: "create" });

    await user.click(screen.getByRole("button", { name: "Create Recipe" }));

    expect(await screen.findByText(/Recipe name must be/)).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("requires at least one non-blank ingredient and direction step", async () => {
    const user = userEvent.setup();
    renderForm({ mode: "create" });

    await user.type(screen.getByLabelText("Recipe Name"), "Pancakes");
    await user.click(screen.getByRole("button", { name: "Create Recipe" }));

    expect(await screen.findByText("At least one ingredient is required.")).toBeInTheDocument();
    expect(screen.getByText("At least one direction step is required.")).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("filters out blank ingredient/direction rows on submit", async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ id: 5, name: "Pancakes" }),
    });
    renderForm({ mode: "create" });

    await user.type(screen.getByLabelText("Recipe Name"), "Pancakes");
    await user.type(screen.getByLabelText("Ingredient 1 name"), "vanilla");
    await user.click(screen.getByRole("button", { name: "+ Add ingredient" }));
    await user.type(screen.getByLabelText("Direction step 1"), "Mix and cook.");

    await user.click(screen.getByRole("button", { name: "Create Recipe" }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/recipes/5"));
    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse(init.body as string);
    expect(body.ingredients).toHaveLength(1);
    expect(body.ingredients[0].name).toBe("vanilla");
    expect(body.directions).toEqual([{ step_text: "Mix and cook." }]);
  });

  it("fills in a quick fraction when a fraction button is clicked", async () => {
    const user = userEvent.setup();
    renderForm({ mode: "create" });

    await user.click(screen.getByRole("button", { name: "1/2" }));

    expect(screen.getByLabelText("Ingredient 1 quantity")).toHaveValue("1/2");
  });

  it("navigates back to the portal on cancel when the form is untouched", async () => {
    const user = userEvent.setup();
    renderForm({ mode: "create" });

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(pushMock).toHaveBeenCalledWith("/recipes");
  });

  it("asks for confirmation when cancelling with unsaved changes", async () => {
    const user = userEvent.setup();
    renderForm({ mode: "create" });

    await user.type(screen.getByLabelText("Recipe Name"), "Pancakes");
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.getByText("Discard changes?")).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Discard changes" }));
    expect(pushMock).toHaveBeenCalledWith("/recipes");
  });
});

describe("RecipeForm - edit mode", () => {
  it("pre-fills fields from the existing recipe", () => {
    renderForm({ mode: "edit", recipeId: 1, initialRecipe: EXISTING_RECIPE });

    expect(screen.getByLabelText("Recipe Name")).toHaveValue("Pancakes");
    expect(screen.getByLabelText("Ingredient 1 name")).toHaveValue("vanilla");
    expect(screen.getByLabelText("Direction step 1")).toHaveValue("Mix and cook.");
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("shows a delete button that asks for confirmation before deleting", async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true });
    renderForm({ mode: "edit", recipeId: 1, initialRecipe: EXISTING_RECIPE });

    await user.click(screen.getByRole("button", { name: "Delete Recipe" }));
    expect(screen.getByText("Delete this recipe?")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/recipes"));
    expect(global.fetch).toHaveBeenCalledWith("/api/recipes/1", { method: "DELETE" });
  });

  it("cancels back to the recipe's own page rather than the portal", async () => {
    const user = userEvent.setup();
    renderForm({ mode: "edit", recipeId: 1, initialRecipe: EXISTING_RECIPE });

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(pushMock).toHaveBeenCalledWith("/recipes/1");
  });
});
