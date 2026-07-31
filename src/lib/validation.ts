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
