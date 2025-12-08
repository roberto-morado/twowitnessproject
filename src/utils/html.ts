/**
 * HTML Utility Functions
 * Provides HTML escaping to prevent XSS (Cross-Site Scripting) attacks
 */

/**
 * Escape HTML special characters to prevent XSS attacks
 * Converts characters like <, >, &, ", ' to their HTML entity equivalents
 *
 * @param text - The text to escape
 * @returns Escaped text safe for HTML insertion
 *
 * @example
 * escapeHtml('<script>alert("XSS")</script>')
 * // Returns: '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };

  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Escape HTML attributes (more strict than content escaping)
 * Use this when inserting user content into HTML attributes
 *
 * @param text - The text to escape
 * @returns Escaped text safe for HTML attributes
 */
export function escapeHtmlAttribute(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Strip all HTML tags from a string
 * Use this when you need plain text output from potentially HTML-containing input
 *
 * @param html - The HTML string to strip
 * @returns Plain text without HTML tags
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

/**
 * Truncate text and add ellipsis if it exceeds max length
 * Useful for displaying excerpts
 *
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @param ellipsis - String to append when truncated (default: "...")
 * @returns Truncated text
 */
export function truncate(text: string, maxLength: number, ellipsis = "..."): string {
  if (text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength - ellipsis.length) + ellipsis;
}
