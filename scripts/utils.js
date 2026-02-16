/**
 * Shared utility functions for Master Chef
 *
 * These functions are used across multiple HTML files to prevent code duplication.
 *
 * @module utils
 */

/**
 * Escape HTML special characters to prevent XSS attacks
 *
 * @param {string} text - User input text
 * @returns {string} - HTML-escaped text safe for innerHTML
 *
 * @example
 * const userInput = '<script>alert("XSS")</script>';
 * const safe = escapeHTML(userInput);
 * element.innerHTML = safe; // Displays as text, doesn't execute
 */
export function escapeHTML(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Escape HTML attribute values
 *
 * @param {string} text - Text to escape for use in HTML attributes
 * @returns {string} - Escaped text safe for attribute values
 *
 * @example
 * const userInput = 'My "Recipe"';
 * const safe = escapeAttr(userInput);
 * // <div title="${escapeAttr(userInput)}">
 */
export function escapeAttr(text) {
  if (!text) return '';
  return text
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Escape quotes and backslashes for PocketBase filter strings
 * Prevents filter injection attacks
 *
 * @param {string} value - Filter value from user input
 * @returns {string} - Escaped filter value
 *
 * @example
 * const userSearch = 'O\'Reilly'; // Contains single quote
 * const filter = `title = "${escapeFilter(userSearch)}"`;
 * // Safe: title = "O\'Reilly"
 */
export function escapeFilter(value) {
  if (typeof value !== 'string') return '';

  return value
    .replace(/\\/g, '\\\\')  // Escape backslashes first
    .replace(/"/g, '\\"')     // Escape double quotes
    .replace(/'/g, "\\'");    // Escape single quotes
}

/**
 * Format time duration for display
 *
 * @param {number} minutes - Duration in minutes
 * @returns {string} - Formatted time (e.g., "1h 30m" or "45m")
 */
export function formatTime(minutes) {
  if (!minutes) return '';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
