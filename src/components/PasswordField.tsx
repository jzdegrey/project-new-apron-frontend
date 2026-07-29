"use client";

import { useId, useState } from "react";
import styles from "./AuthForm.module.css";

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
    <div className={styles.field}>
      <label htmlFor={inputId}>{label}</label>
      <div className={styles.passwordRow}>
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          value={value}
          autoComplete={autoComplete}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={!!error}
        />
        <button
          type="button"
          className={styles.showPasswordButton}
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      {helperText}
      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
}
