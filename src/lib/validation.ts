/**
 * Client-side validation mirroring the backend's rules (see the backend's
 * `app/schemas/user.py`). Kept in sync by hand across repos, since the
 * frontend, backend, and react-native app each validate independently.
 */

export const USERNAME_RE = /^[A-Za-z0-9]{5,32}$/;
export const NAME_RE = /^[A-Za-z0-9 _-]{3,64}$/;
export const PHONE_RE = /^\+?[0-9()\-.\s]{7,20}$/;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MIN_AGE_YEARS = 18;

export function validateUsername(value: string): string | null {
  if (!USERNAME_RE.test(value)) {
    return "Username must be 5-32 characters and contain only letters and numbers.";
  }
  return null;
}

export function validatePassword(value: string): string | null {
  if (value.length < 6 || value.length > 64) {
    return "Password must be 6-64 characters.";
  }
  return null;
}

export function validateConfirmPassword(password: string, confirmPassword: string): string | null {
  if (confirmPassword !== password) {
    return "Passwords do not match.";
  }
  return null;
}

export function validateName(value: string): string | null {
  if (!NAME_RE.test(value)) {
    return "Must be 3-64 characters: letters, numbers, spaces, dashes, and underscores only.";
  }
  return null;
}

function ageInYears(dob: Date, today: Date): number {
  let years = today.getFullYear() - dob.getFullYear();
  const monthDay = [today.getMonth(), today.getDate()];
  const dobMonthDay = [dob.getMonth(), dob.getDate()];
  if (monthDay[0] < dobMonthDay[0] || (monthDay[0] === dobMonthDay[0] && monthDay[1] < dobMonthDay[1])) {
    years -= 1;
  }
  return years;
}

export function validateDateOfBirth(value: string): string | null {
  if (!value) {
    return "Date of birth is required.";
  }
  const dob = new Date(`${value}T00:00:00`);
  if (Number.isNaN(dob.getTime())) {
    return "Enter a valid date.";
  }
  const today = new Date();
  if (dob.getTime() > today.getTime()) {
    return "Date of birth cannot be in the future.";
  }
  if (ageInYears(dob, today) < MIN_AGE_YEARS) {
    return `You must be at least ${MIN_AGE_YEARS} years old to register.`;
  }
  return null;
}

export function validateEmail(value: string): string | null {
  if (!value) {
    return null;
  }
  if (!EMAIL_RE.test(value)) {
    return "Enter a valid email address.";
  }
  return null;
}

export function validatePhoneNumber(value: string): string | null {
  if (!value) {
    return null;
  }
  if (!PHONE_RE.test(value)) {
    return "Enter a valid phone number.";
  }
  return null;
}

/**
 * Recipe field rules mirror the backend's `app/schemas/recipe.py`.
 */

export const RECIPE_NAME_MAX_LENGTH = 60;
export const RECIPE_TEXT_MAX_LENGTH = 4098;
export const INGREDIENT_NAME_MAX_LENGTH = 30;
export const INGREDIENT_QUANTITY_MAX = 99;
export const DIRECTION_STEP_MAX_LENGTH = 255;
export const MAX_RECIPE_IMAGE_BYTES = 2 * 1024 * 1024;
export const ACCEPTED_RECIPE_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export function validateRecipeName(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length < 1 || trimmed.length > RECIPE_NAME_MAX_LENGTH) {
    return `Recipe name must be 1-${RECIPE_NAME_MAX_LENGTH} characters.`;
  }
  return null;
}

function validateOptionalRecipeText(value: string): string | null {
  if (value.trim().length > RECIPE_TEXT_MAX_LENGTH) {
    return `Must be no more than ${RECIPE_TEXT_MAX_LENGTH} characters.`;
  }
  return null;
}

export function validateRecipeDescription(value: string): string | null {
  return validateOptionalRecipeText(value);
}

export function validateRecipeNotes(value: string): string | null {
  return validateOptionalRecipeText(value);
}

export function validateIngredientQuantity(quantity: number | null): string | null {
  if (quantity === null || Number.isNaN(quantity)) {
    return "Enter a quantity, like 1 or 1/2.";
  }
  if (quantity <= 0 || quantity > INGREDIENT_QUANTITY_MAX) {
    return `Quantity must be greater than 0 and no more than ${INGREDIENT_QUANTITY_MAX}.`;
  }
  return null;
}

export function validateIngredientName(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length < 1 || trimmed.length > INGREDIENT_NAME_MAX_LENGTH) {
    return `Ingredient name must be 1-${INGREDIENT_NAME_MAX_LENGTH} characters.`;
  }
  return null;
}

export function validateDirectionStep(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length < 1 || trimmed.length > DIRECTION_STEP_MAX_LENGTH) {
    return `Each step must be 1-${DIRECTION_STEP_MAX_LENGTH} characters.`;
  }
  return null;
}

export function validateRecipeImageFile(file: File): string | null {
  if (!ACCEPTED_RECIPE_IMAGE_TYPES.includes(file.type)) {
    return "Photo must be a JPEG, PNG, GIF, or WEBP image.";
  }
  if (file.size > MAX_RECIPE_IMAGE_BYTES) {
    return "Photo must be no larger than 2MB.";
  }
  return null;
}
