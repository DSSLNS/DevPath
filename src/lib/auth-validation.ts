/** Client- and server-safe validation rules for account forms (the server enforces its own limits too). */
export const PASSWORD_MIN = 10;
export const PASSWORD_MAX = 128;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string) {
  if (!email.trim()) return "Enter your email address.";
  if (!EMAIL.test(email.trim())) return "Enter a valid email address, like name@example.com.";
  return null;
}

export function validatePassword(password: string) {
  if (!password) return "Enter a password.";
  if (password.length < PASSWORD_MIN) return `Use at least ${PASSWORD_MIN} characters.`;
  if (password.length > PASSWORD_MAX) return `Use at most ${PASSWORD_MAX} characters.`;
  if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) return "Include at least one letter and one number.";
  return null;
}

export function validateName(name: string) {
  if (!name.trim()) return "Enter your name or a display name.";
  if (name.trim().length > 60) return "Use 60 characters or fewer.";
  return null;
}

/** Only same-site paths are allowed as post-login destinations (prevents open redirects). */
export function safeNext(next: string | null | undefined) {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : "/";
}
