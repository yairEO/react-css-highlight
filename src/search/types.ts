import type {
  BaseController,
  BaseHighlightOptions,
  HighlightChangeHandler,
} from "../shared/types";

export interface HighlightMatch {
  text: string;
  range: Range;
  index: number;
  searchTerm: string;
}

/**
 * Vanilla / programmatic search-highlight options
 * (React HighlightProps adds targetRef).
 */
export interface HighlightOptions extends BaseHighlightOptions {
  search: string | string[];
  highlightName?: string;
  caseSensitive?: boolean;
  wholeWord?: boolean;
  maxHighlights?: number;
  onHighlightChange?: HighlightChangeHandler;
  /** Fired after idle registration applies ranges to CSS.highlights */
  onPaint?: (info: { matchCount: number }) => void;
}

export interface HighlightController extends BaseController {
  /**
   * Match count from last synchronous compute.
   * Painting may follow on the next idle slice.
   */
  readonly matchCount: number;
  update(options: Partial<HighlightOptions>): void;
  refresh(search?: string | string[]): void;
  destroy(): void;
}
