export { createHighlight } from "./create";
export { findTextMatches, normalizeSearchTerms } from "./findMatches";
export { default as Highlight } from "./Highlight";
export { default as HighlightWrapper } from "./HighlightWrapper";
export type {
  HighlightProps,
  HighlightWrapperProps,
  UseHighlightResult,
} from "./reactTypes";
export type { HighlightController, HighlightMatch, HighlightOptions } from "./types";
export { useDebounce } from "./useDebounce";
export { useHighlight } from "./useHighlight";
