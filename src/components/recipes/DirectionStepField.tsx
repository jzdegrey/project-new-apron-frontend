"use client";

import { useRef, useState } from "react";
import { DIRECTION_STEP_MAX_LENGTH } from "@/lib/validation";
import { DirectionText } from "@/components/recipes/DirectionText";
import type { IngredientDetail } from "@/components/recipes/DirectionText";

const fieldInputClass =
  "min-h-16 rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 shadow-sm outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 aria-[invalid=true]:border-red-500";
const errorTextClass = "m-0 text-sm text-red-600";

interface WordRange {
  start: number;
  end: number;
  word: string;
}

function currentWordRange(text: string, cursor: number): WordRange {
  let start = cursor;
  while (start > 0 && !/\s/.test(text[start - 1])) {
    start -= 1;
  }
  let end = cursor;
  while (end < text.length && !/\s/.test(text[end])) {
    end += 1;
  }
  return { start, end, word: text.slice(start, end) };
}

interface DirectionStepFieldProps {
  value: string;
  onChange: (value: string) => void;
  ingredients: IngredientDetail[];
  error?: string | null;
  ariaLabel: string;
}

/** Direction step textarea with ingredient auto-suggest and a live highlighted preview. */
export function DirectionStepField({
  value,
  onChange,
  ingredients,
  error,
  ariaLabel,
}: DirectionStepFieldProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const ingredientNames = ingredients.map((ingredient) => ingredient.name);

  function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const text = event.target.value;
    onChange(text);

    const cursor = event.target.selectionStart ?? text.length;
    const { word } = currentWordRange(text, cursor);
    if (word.length >= 2) {
      const matches = ingredientNames.filter(
        (name) =>
          name.toLowerCase().startsWith(word.toLowerCase()) &&
          name.toLowerCase() !== word.toLowerCase()
      );
      setSuggestions(Array.from(new Set(matches)).slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }

  function applySuggestion(name: string) {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }
    const cursor = textarea.selectionStart ?? value.length;
    const { start, end } = currentWordRange(value, cursor);
    const nextValue = `${value.slice(0, start)}${name}${value.slice(end)}`;
    onChange(nextValue);
    setSuggestions([]);
    requestAnimationFrame(() => {
      const newCursor = start + name.length;
      textarea.focus();
      textarea.setSelectionRange(newCursor, newCursor);
    });
  }

  return (
    <div className="relative flex flex-col gap-1">
      <textarea
        ref={textareaRef}
        aria-label={ariaLabel}
        className={fieldInputClass}
        value={value}
        maxLength={DIRECTION_STEP_MAX_LENGTH}
        onChange={handleChange}
        onBlur={() => setSuggestions([])}
        aria-invalid={!!error}
      />
      {suggestions.length > 0 && (
        <ul className="absolute top-full left-0 z-10 mt-1 w-full rounded-lg border border-stone-200 bg-white py-1 shadow-lg">
          {suggestions.map((name) => (
            <li key={name}>
              <button
                type="button"
                className="block w-full px-3 py-1.5 text-left text-sm text-stone-700 hover:bg-orange-50"
                // onMouseDown so the click registers before the textarea's onBlur clears suggestions.
                onMouseDown={(event) => {
                  event.preventDefault();
                  applySuggestion(name);
                }}
              >
                {name}
              </button>
            </li>
          ))}
        </ul>
      )}
      {value && ingredientNames.some((name) => name) && (
        <p className="text-xs text-stone-500">
          <DirectionText text={value} ingredients={ingredients} />
        </p>
      )}
      {error && <p className={errorTextClass}>{error}</p>}
    </div>
  );
}
