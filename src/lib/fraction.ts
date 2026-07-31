/**
 * Cooking-friendly fraction display/parsing for ingredient quantities.
 *
 * Quantities are stored as decimals (e.g. 0.3333), but recipes are written
 * and read as fractions (e.g. "1/3"), especially on mobile. These helpers
 * convert between the two using the denominators cooks actually use, rather
 * than a generic continued-fraction algorithm that could produce something
 * like "37/111".
 */

const COMMON_DENOMINATORS = [2, 3, 4, 8, 16];
const MATCH_TOLERANCE = 0.01;

/** Format a decimal quantity as a mixed number/fraction string, e.g. 1.5 -> "1 1/2". */
export function formatQuantity(value: number): string {
  if (!Number.isFinite(value)) {
    return "";
  }
  const whole = Math.trunc(value);
  const remainder = Math.abs(value - whole);

  if (remainder < MATCH_TOLERANCE) {
    return String(whole || value);
  }

  for (const denominator of COMMON_DENOMINATORS) {
    const numerator = Math.round(remainder * denominator);
    if (numerator === 0 || numerator === denominator) {
      continue;
    }
    if (Math.abs(remainder - numerator / denominator) < MATCH_TOLERANCE) {
      const fraction = `${numerator}/${denominator}`;
      return whole === 0 ? fraction : `${whole} ${fraction}`;
    }
  }

  // No clean common fraction found; fall back to a trimmed decimal.
  return String(Math.round(value * 10000) / 10000);
}

/**
 * Parse user input like "1 1/2", "1/2", "2.5", or "2" into a decimal number.
 * Returns null for unparseable input.
 */
export function parseQuantityInput(text: string): number | null {
  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }

  const mixedMatch = trimmed.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    const [, whole, numerator, denominator] = mixedMatch;
    const denominatorValue = Number(denominator);
    if (denominatorValue === 0) {
      return null;
    }
    return Number(whole) + Number(numerator) / denominatorValue;
  }

  const fractionMatch = trimmed.match(/^(\d+)\/(\d+)$/);
  if (fractionMatch) {
    const [, numerator, denominator] = fractionMatch;
    const denominatorValue = Number(denominator);
    if (denominatorValue === 0) {
      return null;
    }
    return Number(numerator) / denominatorValue;
  }

  const decimalMatch = trimmed.match(/^\d+(\.\d+)?$/);
  if (decimalMatch) {
    return Number(trimmed);
  }

  return null;
}

/** Common fraction increments offered as quick-pick buttons in the quantity input. */
export const QUICK_FRACTIONS = ["1/4", "1/3", "1/2", "2/3", "3/4"] as const;
