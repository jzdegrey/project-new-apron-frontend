/** @jest-environment jsdom */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmDialog } from "./ConfirmDialog";

describe("ConfirmDialog", () => {
  it("renders nothing when closed", () => {
    render(
      <ConfirmDialog
        open={false}
        title="Delete this recipe?"
        message="This can't be undone."
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("renders the title and message when open", () => {
    render(
      <ConfirmDialog
        open
        title="Delete this recipe?"
        message="This can't be undone."
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByText("Delete this recipe?")).toBeInTheDocument();
    expect(screen.getByText("This can't be undone.")).toBeInTheDocument();
  });

  it("calls onConfirm when the confirm button is clicked", async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn();

    render(
      <ConfirmDialog
        open
        title="Delete?"
        message="Sure?"
        confirmLabel="Delete"
        onConfirm={onConfirm}
        onCancel={jest.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when the cancel button is clicked", async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();

    render(
      <ConfirmDialog
        open
        title="Delete?"
        message="Sure?"
        onConfirm={jest.fn()}
        onCancel={onCancel}
      />
    );

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when clicking the overlay", async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();

    render(
      <ConfirmDialog
        open
        title="Delete?"
        message="Sure?"
        onConfirm={jest.fn()}
        onCancel={onCancel}
      />
    );

    await user.click(screen.getByRole("alertdialog").parentElement as HTMLElement);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when pressing Escape", async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();

    render(
      <ConfirmDialog
        open
        title="Delete?"
        message="Sure?"
        onConfirm={jest.fn()}
        onCancel={onCancel}
      />
    );

    await user.keyboard("{Escape}");
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
