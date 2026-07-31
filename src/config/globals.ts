/**
 * Central place for global, project-level configuration.
 *
 * Values are sourced from environment variables (populated locally via a
 * `.env` file, see `.env.example`) so secrets never live in source control.
 */

export type AppEnv = "local" | "stg" | "prod";

const VALID_APP_ENVS: readonly AppEnv[] = ["local", "stg", "prod"];

function isAppEnv(value: string | undefined): value is AppEnv {
  return !!value && (VALID_APP_ENVS as readonly string[]).includes(value);
}

function resolveAppEnv(): AppEnv {
  const raw = process.env.APP_ENV;
  if (!isAppEnv(raw)) {
    throw new Error(
      `APP_ENV must be one of ${VALID_APP_ENVS.join(", ")}, got "${raw ?? "undefined"}". ` +
        "Set it in your .env file (see .env.example)."
    );
  }
  return raw;
}

export const globals = {
  /** Which environment this instance is running in: local | stg | prod. */
  appEnv: resolveAppEnv(),
  /** Base URL of the backend API this frontend talks to. */
  apiBaseUrl: process.env.API_BASE_URL ?? "http://localhost:8000",
  /** Secret used for server-side session signing/encryption. */
  sessionSecret: process.env.SESSION_SECRET ?? "",
  /** Minimum level the logger will emit. */
  logLevel: process.env.LOG_LEVEL ?? "info",
} as const;
