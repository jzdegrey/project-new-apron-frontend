/**
 * Minimal, dependency-free logger that works the same way on the Next.js
 * server and in the browser: both write structured JSON lines to console.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const isServer = typeof window === "undefined";

function currentLevel(): LogLevel {
  const configured = process.env.NEXT_PUBLIC_LOG_LEVEL ?? process.env.LOG_LEVEL;
  if (configured && configured in LEVEL_ORDER) {
    return configured as LogLevel;
  }
  return "info";
}

function write(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  if (LEVEL_ORDER[level] < LEVEL_ORDER[currentLevel()]) {
    return;
  }

  const line = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    context: isServer ? "server" : "browser",
    message,
    ...(meta ? { meta } : {}),
  });

  console[level === "debug" ? "debug" : level](line);
}

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => write("debug", message, meta),
  info: (message: string, meta?: Record<string, unknown>) => write("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => write("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>) => write("error", message, meta),
};
