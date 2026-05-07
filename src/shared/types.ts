/** Callback when diff / match counts change synchronously after compute */
export type HighlightChangeHandler = (count: number) => void;

/** Highlight / compare error callback */
export type HighlightErrorHandler = (error: Error) => void;

/** Fields shared by all DOM highlight controllers (search + compare) */
export interface BaseHighlightOptions {
  /** Extra tag names merged with IGNORED_TAG_NAMES; descendant text skipped */
  ignoredTags?: string[];
  /**
   * Debounce in ms before running compute/register cycle.
   * 0 = immediate (after microtask coalescing).
   */
  debounce?: number;
  /** Error callback */
  onError?: HighlightErrorHandler;
}

/** Lifecycle shared by all controllers */
export interface BaseController {
  readonly destroyed: boolean;
  refresh(): void;
  destroy(): void;
}

/** Resolved optional fields — maps `T`'s optional keys to required */
export type WithDefaults<T extends object> = { [K in keyof T]-?: T[K] };
