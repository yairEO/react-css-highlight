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

/**
 * Result returned by a custom {@link DiffFn}.
 *
 * `baseRanges` are flat-text offsets into the **base** side; `compareRanges` are
 * flat-text offsets into the **compare** side. Edit-script algorithms (LCS / Myers
 * / Patience / Histogram) typically produce *different* ranges per side: deletions
 * exist only on base, insertions only on compare. Positional diffs produce the
 * same ranges on both sides.
 *
 * `diffCount` is opaque to the controller — emitted as-is via `onDiffChange`.
 * Pick a meaningful unit for your algorithm (positions, edit ops, hunks, …) and
 * document it for your callers.
 */
export interface CustomDiffResult {
  baseRanges: DiffRange[];
  compareRanges: DiffRange[];
  diffCount: number;
}

/**
 * Pluggable diff function. Receives the two flattened strings and must return
 * `CustomDiffResult`. Out-of-bound ranges are clipped by the range mapper.
 *
 * Must be **synchronous**. Throwing routes through `onError` and clears highlights.
 */
export type DiffFn = (baseText: string, compareText: string) => CustomDiffResult;

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
  /**
   * Synchronous notification after compute. Default unit = differing UTF-16
   * code-unit positions. With a custom {@link CompareOptions.diff}, the unit
   * is whatever your `DiffFn` returns as `diffCount`.
   */
  onDiffChange?: HighlightChangeHandler;
  /** After idle registration succeeds for both highlights */
  onPaint?: (info: { diffCount: number }) => void;
  /**
   * Optional pluggable diff. Default = positional UTF-16 code-unit compare
   * (same per-index algorithm always used by this library). Supply your own
   * `DiffFn` to switch to edit-script algorithms (LCS / Myers / Patience /
   * Histogram) at any granularity (char / word / line / token).
   *
   * The library does **not** ship those algorithms — bring your own (e.g.
   * [`fast-diff`](https://github.com/jhchen/fast-diff), `diff`, `diff-match-patch`)
   * and adapt the result to {@link CustomDiffResult}.
   *
   * Must be synchronous. Replacing this option triggers a recompute.
   */
  diff?: DiffFn;
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
