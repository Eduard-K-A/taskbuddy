// ─── Form validation ──────────────────────────────────────────────────────────
// Shared client-side validation rules. Each validator returns an error message
// string, or null when the value is valid — so callers can do:
//   const err = validateEmail(email); if (err) { ... }

/** Pragmatic email check: something@something.tld, no spaces. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const PASSWORD_MIN_LENGTH = 8;
export const NAME_MAX_LENGTH = 60;

export function validateRequired(value: string, label: string): string | null {
  if (!value.trim()) return `${label} is required.`;
  return null;
}

export function validateEmail(value: string, label = "Email"): string | null {
  const required = validateRequired(value, label);
  if (required) return required;
  if (!EMAIL_RE.test(value.trim())) return `${label} must be a valid email address.`;
  return null;
}

export function validateName(value: string, label = "Name"): string | null {
  const required = validateRequired(value, label);
  if (required) return required;
  if (value.trim().length < 2) return `${label} must be at least 2 characters.`;
  if (value.trim().length > NAME_MAX_LENGTH) return `${label} must be ${NAME_MAX_LENGTH} characters or fewer.`;
  return null;
}

/** Standard password strength: min length + at least one letter and one number. */
export function validatePassword(value: string, label = "Password"): string | null {
  if (!value) return `${label} is required.`;
  if (value.length < PASSWORD_MIN_LENGTH) return `${label} must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  if (!/[a-zA-Z]/.test(value)) return `${label} must contain at least one letter.`;
  if (!/[0-9]/.test(value)) return `${label} must contain at least one number.`;
  return null;
}

export interface PasswordChangeErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

/** Validates the change-password trio. Assumes the caller only invokes this
 *  when a change is being attempted (i.e. newPassword is non-empty). */
export function validatePasswordChange(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
): PasswordChangeErrors {
  const errors: PasswordChangeErrors = {};
  if (!currentPassword) errors.currentPassword = "Enter your current password to set a new one.";
  const strength = validatePassword(newPassword, "New password");
  if (strength) errors.newPassword = strength;
  else if (newPassword === currentPassword) errors.newPassword = "New password must be different from the current password.";
  if (!errors.newPassword && confirmPassword !== newPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }
  return errors;
}
