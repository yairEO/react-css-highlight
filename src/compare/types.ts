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

/** Accepted by `createCompareHighlight` — live subtree or flattened reference string */
export type CompareInput = HTMLElement | string;

/** Normalized comparison side after construction */
export type CompareSource =
  | { readonly kind: "element"; readonly element: HTMLElement }
  | { readonly kind: "text"; readonly text: string };

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
  /** Resolved sides passed to `createCompareHighlight` (discriminate on `kind`) */
  readonly sources: {
    readonly base: CompareSource;
    readonly compare: CompareSource;
  };
  update(options: Partial<CompareOptions>): void;
  refresh(): void;
  destroy(): void;
}
