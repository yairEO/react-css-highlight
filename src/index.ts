// Main component with ref-based API (default export for power users)
export { default } from "./Highlight";
// Export constants
export {
  DEFAULT_DEBOUNCE_MS,
  DEFAULT_MAX_HIGHLIGHTS,
  IGNORED_TAG_NAMES,
  SLOW_SEARCH_THRESHOLD_MS,
} from "./Highlight.constants";
export { useHighlight } from "./Highlight.hooks";
// Export types
export type {
  HighlightMatch,
  HighlightProps,
  HighlightWrapperProps,
  UseHighlightResult,
} from "./Highlight.types";
// Export utility functions for advanced usage
export {
  findTextMatches,
  isHighlightAPISupported,
  normalizeSearchTerms,
  registerHighlight,
  removeHighlight,
} from "./Highlight.utils";
// Convenience wrapper component (named export for simple cases)
export { default as HighlightWrapper } from "./HighlightWrapper";
// Export hooks for advanced usage
export { useDebounce } from "./useDebounce";
