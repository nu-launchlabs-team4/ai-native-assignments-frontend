// Checks the forms run before calling the backend, so mistakes show next to the field
// in the app's own words instead of as a browser tooltip. The backend checks again.

/** Mirrors the backend's SignupIn limits. */
export const PASSWORD_MIN_CHARS = 8;
export const PASSWORD_MAX_CHARS = 72;
export const EMAIL_MAX_CHARS = 320;

export type AuthFieldName = "email" | "password";
export type FieldErrors = Partial<Record<AuthFieldName, string>>;

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** The problem with an email address, or null when it looks right. */
export function emailError(email: string): string | null {
  if (!email.trim()) return "Enter your email address.";
  if (!EMAIL_PATTERN.test(email.trim())) return "Enter an email address like name@university.edu.";
  return null;
}

/** The problem with a password. Only a new password has to meet the length rule. */
export function passwordError(password: string, isNew: boolean): string | null {
  if (!password) return isNew ? `Choose a password with at least ${PASSWORD_MIN_CHARS} characters.` : "Enter your password.";
  if (isNew && password.length < PASSWORD_MIN_CHARS) {
    return `Choose a password with at least ${PASSWORD_MIN_CHARS} characters.`;
  }
  return null;
}

/** Both fields' problems, keyed by field. Empty when the form can be sent. */
export function formErrors(email: string, password: string, isNewPassword: boolean): FieldErrors {
  const errors: FieldErrors = {};
  const forEmail = emailError(email);
  const forPassword = passwordError(password, isNewPassword);
  if (forEmail) errors.email = forEmail;
  if (forPassword) errors.password = forPassword;
  return errors;
}

/** Move the cursor to the first field with a problem, so keyboard and screen reader users land on it. */
export function focusFirstInvalid(form: HTMLFormElement, errors: FieldErrors): void {
  const first = (["email", "password"] as const).find((name) => errors[name]);
  if (first) form.querySelector<HTMLInputElement>(`input[name="${first}"]`)?.focus();
}
