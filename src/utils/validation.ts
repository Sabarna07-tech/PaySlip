/**
 * Lightweight, India-aware field validators. These never block input — the UI
 * uses them to show non-intrusive "doesn't look right" hints so payroll data
 * stays clean without getting in the user's way.
 */

const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const UAN_RE = /^\d{12}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidPAN(value: string): boolean {
  return PAN_RE.test(value.trim().toUpperCase());
}

export function isValidIFSC(value: string): boolean {
  return IFSC_RE.test(value.trim().toUpperCase());
}

export function isValidUAN(value: string): boolean {
  return UAN_RE.test(value.trim());
}

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

/**
 * Returns a hint string when a non-empty value fails its format check, or
 * null when the value is empty (optional) or valid.
 */
export function fieldHint(kind: "pan" | "ifsc" | "uan" | "email", value: string | undefined): string | null {
  const v = (value ?? "").trim();
  if (!v) return null;
  switch (kind) {
    case "pan":
      return isValidPAN(v) ? null : "PAN should look like ABCDE1234F";
    case "ifsc":
      return isValidIFSC(v) ? null : "IFSC should look like HDFC0001234";
    case "uan":
      return isValidUAN(v) ? null : "UAN should be 12 digits";
    case "email":
      return isValidEmail(v) ? null : "Enter a valid email address";
  }
}

/** Caps free-text fields so a single value can't bloat local storage. */
export function clampText(value: string, max = 120): string {
  return value.length > max ? value.slice(0, max) : value;
}
