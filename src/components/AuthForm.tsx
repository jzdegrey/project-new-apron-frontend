"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/Toast";
import { PasswordField } from "@/components/PasswordField";
import {
  validateConfirmPassword,
  validateDateOfBirth,
  validateEmail,
  validateName,
  validatePassword,
  validatePhoneNumber,
  validateUsername,
} from "@/lib/validation";
import styles from "./AuthForm.module.css";

type Mode = "sign-in" | "create-account";
type FieldErrors = Record<string, string | undefined>;

interface FormState {
  username: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  email: string;
  phone_number: string;
  agreed_to_terms: boolean;
  email_subscription_opt_in: boolean;
}

const INITIAL_STATE: FormState = {
  username: "",
  password: "",
  confirm_password: "",
  first_name: "",
  last_name: "",
  date_of_birth: "",
  email: "",
  phone_number: "",
  agreed_to_terms: false,
  email_subscription_opt_in: true,
};

function validateCreateAccountForm(form: FormState): FieldErrors {
  const errors: FieldErrors = {};

  errors.username = validateUsername(form.username) ?? undefined;
  errors.password = validatePassword(form.password) ?? undefined;
  errors.confirm_password =
    validateConfirmPassword(form.password, form.confirm_password) ?? undefined;
  errors.first_name = validateName(form.first_name) ?? undefined;
  errors.last_name = validateName(form.last_name) ?? undefined;
  errors.date_of_birth = validateDateOfBirth(form.date_of_birth) ?? undefined;
  errors.email = validateEmail(form.email) ?? undefined;
  errors.phone_number = validatePhoneNumber(form.phone_number) ?? undefined;
  if (!form.agreed_to_terms) {
    errors.agreed_to_terms = "You must agree to the Terms of Service and Privacy Policy.";
  }

  return Object.fromEntries(Object.entries(errors).filter(([, value]) => value));
}

function validateSignInForm(form: FormState): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.username) {
    errors.username = "Username is required.";
  }
  if (!form.password) {
    errors.password = "Password is required.";
  }
  return errors;
}

export function AuthForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function switchMode(nextMode: Mode) {
    setMode(nextMode);
    setErrors({});
    setFormError(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    const fieldErrors =
      mode === "create-account" ? validateCreateAccountForm(form) : validateSignInForm(form);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      const endpoint = mode === "create-account" ? "/api/auth/register" : "/api/auth/login";
      const body =
        mode === "create-account"
          ? {
              ...form,
              email: form.email || undefined,
              phone_number: form.phone_number || undefined,
            }
          : { username: form.username, password: form.password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        router.push("/welcome");
        return;
      }

      const data = await response.json().catch(() => ({}));

      if (response.status === 422 && data.fieldErrors) {
        setErrors(data.fieldErrors);
        return;
      }
      if (response.status === 401 || response.status === 423 || response.status === 409) {
        setFormError(data.message ?? "Something went wrong. Please try again.");
        return;
      }

      showToast(data.message ?? "Something went wrong on our end. Please try again in a moment.");
    } catch {
      showToast("Unable to reach the server. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <h1>{mode === "sign-in" ? "Sign In" : "Create Account"}</h1>

      <div className={styles.field}>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          value={form.username}
          autoComplete="username"
          onChange={(event) => updateField("username", event.target.value)}
          aria-invalid={!!errors.username}
        />
        {errors.username && <p className={styles.errorText}>{errors.username}</p>}
      </div>

      <PasswordField
        label="Password"
        value={form.password}
        onChange={(value) => updateField("password", value)}
        error={errors.password}
        autoComplete={mode === "create-account" ? "new-password" : "current-password"}
        helperText={
          mode === "create-account" && form.password ? (
            <p className={validatePassword(form.password) ? styles.hintInvalid : styles.hintValid}>
              {validatePassword(form.password) ?? "Password meets the length requirement."}
            </p>
          ) : undefined
        }
      />

      {mode === "create-account" && (
        <>
          <PasswordField
            label="Confirm Password"
            value={form.confirm_password}
            onChange={(value) => updateField("confirm_password", value)}
            error={errors.confirm_password}
            autoComplete="new-password"
            helperText={
              form.confirm_password ? (
                <p
                  className={
                    validateConfirmPassword(form.password, form.confirm_password)
                      ? styles.hintInvalid
                      : styles.hintValid
                  }
                >
                  {validateConfirmPassword(form.password, form.confirm_password) ??
                    "Passwords match."}
                </p>
              ) : undefined
            }
          />

          <div className={styles.field}>
            <label htmlFor="first_name">First Name</label>
            <input
              id="first_name"
              value={form.first_name}
              autoComplete="given-name"
              onChange={(event) => updateField("first_name", event.target.value)}
              aria-invalid={!!errors.first_name}
            />
            {errors.first_name && <p className={styles.errorText}>{errors.first_name}</p>}
          </div>

          <div className={styles.field}>
            <label htmlFor="last_name">Last Name</label>
            <input
              id="last_name"
              value={form.last_name}
              autoComplete="family-name"
              onChange={(event) => updateField("last_name", event.target.value)}
              aria-invalid={!!errors.last_name}
            />
            {errors.last_name && <p className={styles.errorText}>{errors.last_name}</p>}
          </div>

          <div className={styles.field}>
            <label htmlFor="date_of_birth">Date of Birth</label>
            <input
              id="date_of_birth"
              type="date"
              value={form.date_of_birth}
              autoComplete="bday"
              onChange={(event) => updateField("date_of_birth", event.target.value)}
              aria-invalid={!!errors.date_of_birth}
            />
            {errors.date_of_birth && <p className={styles.errorText}>{errors.date_of_birth}</p>}
          </div>

          <div className={styles.field}>
            <label htmlFor="email">Email (optional)</label>
            <input
              id="email"
              type="email"
              value={form.email}
              autoComplete="email"
              onChange={(event) => updateField("email", event.target.value)}
              aria-invalid={!!errors.email}
            />
            {errors.email && <p className={styles.errorText}>{errors.email}</p>}
          </div>

          <div className={styles.field}>
            <label htmlFor="phone_number">Phone Number (optional)</label>
            <input
              id="phone_number"
              type="tel"
              value={form.phone_number}
              autoComplete="tel"
              onChange={(event) => updateField("phone_number", event.target.value)}
              aria-invalid={!!errors.phone_number}
            />
            {errors.phone_number && <p className={styles.errorText}>{errors.phone_number}</p>}
          </div>

          <div className={styles.checkboxField}>
            <label>
              <input
                type="checkbox"
                checked={form.agreed_to_terms}
                onChange={(event) => updateField("agreed_to_terms", event.target.checked)}
              />
              I agree to the{" "}
              <a href="#" target="_blank" rel="noreferrer">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" target="_blank" rel="noreferrer">
                Privacy Policy
              </a>
            </label>
            {errors.agreed_to_terms && <p className={styles.errorText}>{errors.agreed_to_terms}</p>}
          </div>

          <div className={styles.checkboxField}>
            <label>
              <input
                type="checkbox"
                checked={form.email_subscription_opt_in}
                onChange={(event) => updateField("email_subscription_opt_in", event.target.checked)}
              />
              Sign up for email updates
            </label>
          </div>
        </>
      )}

      {formError && (
        <p className={styles.errorText} role="alert">
          {formError}
        </p>
      )}

      <button type="submit" disabled={submitting}>
        {mode === "sign-in" ? "Sign In" : "Create Account"}
      </button>

      <button
        type="button"
        className={styles.switchModeButton}
        onClick={() => switchMode(mode === "sign-in" ? "create-account" : "sign-in")}
      >
        {mode === "sign-in" ? "Create Account" : "Sign In"}
      </button>
    </form>
  );
}
