/**
 * Constants for the Highlight component
 */

/** Default maximum number of highlights to prevent performance issues */
export const DEFAULT_MAX_HIGHLIGHTS = 1000;

/** Default debounce delay in milliseconds for search updates */
export const DEFAULT_DEBOUNCE_MS = 100;

/** HTML elements whose text content should not be highlighted */
export const IGNORED_TAG_NAMES = [
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "IFRAME",
  "TEXTAREA",
] as const;

/** Performance threshold in milliseconds - warn if search takes longer */
export const SLOW_SEARCH_THRESHOLD_MS = 100;
