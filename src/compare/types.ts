import type {
  BaseController,
  BaseHighlightOptions,
  HighlightChangeHandler,
} from "../shared/types";

export interface DiffRange {
  /** Inclusive flat index where diff begins */
  start: number;
  /** Exclusive flat index after last differing character */
  end: number;
}

/** Result of positional UTF-16 diff between two strings */
export interface PositionalDiffResult {
  ranges: DiffRange[];
  diffCount: number;
}

/** Options for `createCompareHighlight` */
export interface CompareOptions extends BaseHighlightOptions {
  baseHighlightName?: string;
  compareHighlightName?: string;
  /** Synchronous notification after compute; count = differing code-unit positions */
  onDiffChange?: HighlightChangeHandler;
  /** After idle registration succeeds for both highlights */
  onPaint?: (info: { diffCount: number }) => void;
}

/** Compare highlight controller */
export interface CompareController extends BaseController {
  readonly diffCount: number;
  /** Original elements passed to `createCompareHighlight` */
  readonly elements: { readonly base: HTMLElement; readonly compare: HTMLElement };
  update(options: Partial<CompareOptions>): void;
  refresh(): void;
  destroy(): void;
}
