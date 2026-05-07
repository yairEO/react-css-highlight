// Main component with ref-based API (default export for power users)

import "./Highlight.css";

export { createCompareHighlight, positionalDiff } from "./compare";
export type {
  CompareController,
  CompareInput,
  CompareOptions,
  CompareSource,
  DiffRange,
  PositionalDiffResult,
} from "./compare/types";
export {
  findTextMatches,
  normalizeSearchTerms,
} from "./search/findMatches";
export { default } from "./search/Highlight";
export { default as HighlightWrapper } from "./search/HighlightWrapper";
export type {
  HighlightProps,
  HighlightWrapperProps,
  UseHighlightResult,
} from "./search/reactTypes";
export type {
  HighlightController,
  HighlightMatch,
  HighlightOptions,
} from "./search/types";
export { useDebounce } from "./search/useDebounce";
export { useHighlight } from "./search/useHighlight";
export {
  DEFAULT_COMPARE_BASE_HIGHLIGHT,
  DEFAULT_COMPARE_COMPARE_HIGHLIGHT,
  DEFAULT_COMPARE_DEBOUNCE_MS,
  DEFAULT_DEBOUNCE_MS,
  DEFAULT_MAX_HIGHLIGHTS,
  IDLE_TIMEOUT_MS,
  IGNORED_TAG_NAMES,
  SLOW_SEARCH_THRESHOLD_MS,
} from "./shared/constants";
export {
  isHighlightAPISupported,
  registerHighlight,
  removeHighlight,
} from "./shared/cssHighlights";
export { normalizeIgnoredTags } from "./shared/dom";
