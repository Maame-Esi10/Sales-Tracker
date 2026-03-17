/**
 * XSS Protection Utilities
 * Input sanitization and output encoding to reduce attack surface.
 */

const HTML_ENTITY_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
  "`": "&#96;",
};

const ENTITY_RE = /[&<>"'`/]/g;

/** Encode a string so it's safe to render as HTML text content. */
export function encodeHTML(input: string): string {
  if (!input) return "";
  return String(input).replace(ENTITY_RE, (ch) => HTML_ENTITY_MAP[ch] || ch);
}

/** Strip all HTML tags from a string. */
export function stripTags(input: string): string {
  if (!input) return "";
  return String(input).replace(/<[^>]*>/g, "");
}

/**
 * Sanitize a plain-text user input:
 * - trims whitespace
 * - strips HTML tags
 * - limits length
 */
export function sanitizeInput(input: string, maxLength = 500): string {
  if (!input) return "";
  return stripTags(String(input)).trim().slice(0, maxLength);
}

/** Sanitize a numeric input, returning the number or a fallback. */
export function sanitizeNumber(input: unknown, fallback = 0, min?: number, max?: number): number {
  const n = Number(input);
  if (!Number.isFinite(n)) return fallback;
  let result = n;
  if (min !== undefined) result = Math.max(result, min);
  if (max !== undefined) result = Math.min(result, max);
  return result;
}

/** Safely encode a value for use in a URL query parameter. */
export function safeEncodeURI(input: string): string {
  return encodeURIComponent(stripTags(String(input)));
}

/**
 * Validate and sanitize an email address.
 * Returns the trimmed, lowercase email or null if invalid.
 */
export function sanitizeEmail(input: string): string | null {
  const trimmed = String(input).trim().toLowerCase();
  // Basic RFC-5322-ish check
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(trimmed) || trimmed.length > 254) return null;
  return trimmed;
}
