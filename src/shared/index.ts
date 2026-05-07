export {
  DEFAULT_COMPARE_BASE_HIGHLIGHT,
  DEFAULT_COMPARE_COMPARE_HIGHLIGHT,
  DEFAULT_COMPARE_DEBOUNCE_MS,
  DEFAULT_DEBOUNCE_MS,
  DEFAULT_MAX_HIGHLIGHTS,
  IDLE_TIMEOUT_MS,
  IGNORED_TAG_NAMES,
  SLOW_SEARCH_THRESHOLD_MS,
} from "./constants";
export { createControllerCore } from "./controllerKit";
export {
  isHighlightAPISupported,
  registerHighlight,
  removeHighlight,
} from "./cssHighlights";
export {
  buildTextMap,
  createTextNodeFilter,
  createTextRangeSlice,
  isBrowser,
  normalizeIgnoredTags,
  type TextMap,
  type TextMapSegment,
} from "./dom";
export {
  CompareError,
  HighlightError,
  normalizeError,
} from "./errors";
export {
  applyDefaults,
  fieldsChanged,
  mergeOptions,
} from "./options";
export { cancelIdle, createIdleScheduler, scheduleIdle } from "./scheduler";
export { createHighlightTarget, type HighlightTarget } from "./target";
export type {
  BaseController,
  BaseHighlightOptions,
  HighlightChangeHandler,
  HighlightErrorHandler,
  WithDefaults,
} from "./types";
