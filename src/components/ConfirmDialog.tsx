"use client";

import { useEffect } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) {
      return;
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="confirm-dialog-title" className="font-display text-lg font-semibold text-stone-900">
          {title}
        </h2>
        <p id="confirm-dialog-message" className="mt-2 text-sm text-stone-600">
          {message}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={
              danger
                ? "rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700"
                : "rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-700"
            }
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
