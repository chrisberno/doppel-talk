/**
 * Input Sanitization Utilities
 * 
 * Sanitizes user input to prevent XSS and other security issues
 * in exported code and displayed content.
 */

/**
 * Escape HTML special characters
 * Prevents XSS in HTML/XML contexts
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };

  return text.replace(/[&<>"']/g, (char) => map[char] || char);
}

/**
 * Escape XML special characters (for TwiML)
 */
export function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Sanitize text for use in JavaScript/TypeScript code
 * Escapes backticks, dollar signs, and newlines
 */
export function escapeJavaScript(text: string): string {
  return text
    .replace(/\\/g, "\\\\") // Escape backslashes first
    .replace(/`/g, "\\`") // Escape backticks
    .replace(/\${/g, "\\${") // Escape template literal expressions
    .replace(/\n/g, "\\n") // Escape newlines
    .replace(/\r/g, "\\r") // Escape carriage returns
    .replace(/\t/g, "\\t"); // Escape tabs
}

/**
 * Sanitize text for use in Python code
 * Escapes quotes and newlines
 */
export function escapePython(text: string): string {
  return text
    .replace(/\\/g, "\\\\") // Escape backslashes first
    .replace(/"/g, '\\"') // Escape double quotes
    .replace(/'/g, "\\'") // Escape single quotes
    .replace(/\n/g, "\\n") // Escape newlines
    .replace(/\r/g, "\\r") // Escape carriage returns
    .replace(/\t/g, "\\t"); // Escape tabs
}

/**
 * Sanitize text for JSON
 * Ensures proper JSON encoding
 */
export function sanitizeForJson(text: string): string {
  // JSON.stringify handles most escaping, but we can add extra safety
  return JSON.stringify(text).slice(1, -1); // Remove surrounding quotes
}

/**
 * Remove potentially dangerous characters from text
 * Used for general text sanitization
 */
export function sanitizeText(text: string): string {
  // Remove null bytes and control characters (except newlines and tabs)
  return text
    .replace(/\0/g, "") // Remove null bytes
    .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, ""); // Remove control chars
}

/**
 * Validate text length (prevent DoS via extremely long inputs)
 */
export function validateTextLength(text: string, maxLength: number = 10000): {
  valid: boolean;
  error?: string;
} {
  if (text.length > maxLength) {
    return {
      valid: false,
      error: `Text exceeds maximum length of ${maxLength} characters`,
    };
  }
  return { valid: true };
}

