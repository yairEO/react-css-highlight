/**
 * Constants shared by search highlighting and positional compare features.
 */

/** Default maximum number of highlights to prevent performance issues */
export const DEFAULT_MAX_HIGHLIGHTS = 1000;

/** Default debounce delay in milliseconds for search updates */
export const DEFAULT_DEBOUNCE_MS = 100;

/** Compare feature: positional diff debounce default (immediate) */
export const DEFAULT_COMPARE_DEBOUNCE_MS = 0;

/** Idle callback timeout when scheduling highlight registration */
export const IDLE_TIMEOUT_MS = 100;

/** Default ::highlight() name for positional diff base/reference side */
export const DEFAULT_COMPARE_BASE_HIGHLIGHT = "highlight-diff-base";

/** Default ::highlight() name for positional diff modified side */
export const DEFAULT_COMPARE_COMPARE_HIGHLIGHT = "highlight-diff-compare";

/** HTML elements whose text content should not be highlighted */
export const IGNORED_TAG_NAMES = [
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "IFRAME",
  "TEXTAREA",
  "OBJECT",
  "EMBED",
  "SVG",
  "CANVAS",
  "SELECT",
] as const;

/** Performance threshold in milliseconds — warn if search takes longer */
export const SLOW_SEARCH_THRESHOLD_MS = 100;
