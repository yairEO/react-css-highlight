/**
 * @packageDocumentation
 * Advanced / escape-hatch exports (see CHANGELOG 3.0). Semver may treat these as internal.
 */

export { mapDiffToRanges } from "./compare/rangeMapper";
export {
  type ControllerCore,
  createControllerCore,
} from "./shared/controllerKit";
export {
  buildTextMap,
  type TextMap,
  type TextMapSegment,
} from "./shared/dom";
export {
  CompareError,
  HighlightError,
  type HighlightErrorCode,
  normalizeError,
} from "./shared/errors";
export {
  applyDefaults,
  fieldsChanged,
  mergeOptions,
} from "./shared/options";
export {
  cancelIdle,
  createIdleScheduler,
  type IdleScheduler,
  scheduleIdle,
} from "./shared/scheduler";
export { createHighlightTarget, type HighlightTarget } from "./shared/target";
export type { WithDefaults } from "./shared/types";
