"use client";

import { QUICK_FRACTIONS } from "@/lib/fraction";

const fieldInputClass =
  "w-20 rounded-lg border border-stone-300 px-2 py-2 text-sm text-stone-900 shadow-sm outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 aria-[invalid=true]:border-red-500";

interface IngredientQuantityInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  ariaLabel: string;
}

/** A quantity input that accepts whole numbers, decimals, or fractions (e.g. "1 1/2"),
 * with quick-pick buttons for the fractions cooks use most. */
export function IngredientQuantityInput({
  value,
  onChange,
  error,
  ariaLabel,
}: IngredientQuantityInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <input
        type="text"
        inputMode="decimal"
        aria-label={ariaLabel}
        className={fieldInputClass}
        value={value}
        placeholder="1"
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={!!error}
      />
      <div className="flex flex-wrap gap-1">
        {QUICK_FRACTIONS.map((fraction) => (
          <button
            key={fraction}
            type="button"
            className="rounded border border-stone-300 px-1.5 py-0.5 text-xs text-stone-600 transition-colors hover:bg-stone-50"
            onClick={() => onChange(fraction)}
          >
            {fraction}
          </button>
        ))}
      </div>
      {error && <p className="m-0 text-xs text-red-600">{error}</p>}
    </div>
  );
}
