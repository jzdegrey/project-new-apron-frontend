/** @jest-environment jsdom */

import { render, screen, fireEvent } from "@testing-library/react";
import { DirectionText, type IngredientDetail } from "./DirectionText";

const INGREDIENTS: IngredientDetail[] = [{ name: "flour", quantity: 2, unit: "cup" }];

function mockMatchMedia(matches: boolean) {
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
}

describe("DirectionText", () => {
  it("toggles the popup on tap/click when there is no hover-capable pointer", () => {
    mockMatchMedia(false);
    render(<DirectionText text="Add the flour" ingredients={INGREDIENTS} />);

    const button = screen.getByRole("button", { name: "flour" });
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

    fireEvent.click(button);
    expect(screen.getByRole("tooltip")).toHaveTextContent("2 cup flour");

    fireEvent.click(button);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("does not show the popup on mouseenter when there is no hover-capable pointer", () => {
    mockMatchMedia(false);
    render(<DirectionText text="Add the flour" ingredients={INGREDIENTS} />);

    fireEvent.mouseEnter(screen.getByRole("button", { name: "flour" }));
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("shows the popup on hover and hides it on mouse-leave when a mouse pointer is present", () => {
    mockMatchMedia(true);
    render(<DirectionText text="Add the flour" ingredients={INGREDIENTS} />);

    const wrapper = screen.getByRole("button", { name: "flour" }).parentElement as HTMLElement;

    fireEvent.mouseEnter(wrapper);
    expect(screen.getByRole("tooltip")).toHaveTextContent("2 cup flour");

    fireEvent.mouseLeave(wrapper);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("does not toggle the popup on click when a mouse pointer is present", () => {
    mockMatchMedia(true);
    render(<DirectionText text="Add the flour" ingredients={INGREDIENTS} />);

    fireEvent.click(screen.getByRole("button", { name: "flour" }));
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });
});
