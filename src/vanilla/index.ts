/**
 * Vanilla JavaScript API — CSS Custom Highlight helpers (framework-agnostic).
 */

export {
  createCompareHighlight,
  positionalDiff,
} from "../compare";
export type {
  CompareController,
  CompareInput,
  CompareOptions,
  CompareSource,
  DiffRange,
  PositionalDiffResult,
} from "../compare/types";
export { createHighlight } from "../search/create";
export {
  findTextMatches,
  normalizeSearchTerms,
} from "../search/findMatches";
export type {
  HighlightController,
  HighlightMatch,
  HighlightOptions,
} from "../search/types";
export {
  DEFAULT_DEBOUNCE_MS,
  DEFAULT_MAX_HIGHLIGHTS,
  IGNORED_TAG_NAMES,
  SLOW_SEARCH_THRESHOLD_MS,
} from "../shared/constants";
export {
  isHighlightAPISupported,
  registerHighlight,
  removeHighlight,
} from "../shared/cssHighlights";
export { normalizeIgnoredTags } from "../shared/dom";
