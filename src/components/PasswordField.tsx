"use client";

import { useId, useState } from "react";

const fieldLabelClass = "text-sm font-semibold text-stone-700";
const fieldInputClass =
  "rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 shadow-sm outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 aria-[invalid=true]:border-red-500";
const errorTextClass = "m-0 text-sm text-red-600";
const showPasswordButtonClass =
  "rounded-lg border border-stone-300 px-3 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-50";

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  autoComplete?: string;
  helperText?: React.ReactNode;
}

export function PasswordField({
  label,
  value,
  onChange,
  error,
  autoComplete = "current-password",
  helperText,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const inputId = useId();

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className={fieldLabelClass}>
        {label}
      </label>
      <div className="flex gap-2">
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          className={`flex-1 ${fieldInputClass}`}
          value={value}
          autoComplete={autoComplete}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={!!error}
        />
        <button
          type="button"
          className={showPasswordButtonClass}
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      {helperText}
      {error && <p className={errorTextClass}>{error}</p>}
    </div>
  );
}
