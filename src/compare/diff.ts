import type {
  CustomDiffResult,
  DiffFn,
  DiffRange,
  PositionalDiffResult,
} from "./types";

/*
 * Surrogate safety (UTF-16):
 * Code points above U+FFFF are stored as two UTF-16 code units: high surrogate U+D800–U+DBFF
 * immediately followed by low surrogate U+DC00–U+DFFF. DOM Range offsets are per code unit; a
 * Range must not start or end between the two halves of a surrogate pair, or setStart/setEnd
 * can throw or select the wrong logical character. The raw diff works in code units only, so
 * boundaries can land “inside” an astral character on one or both strings — we snap them.
 */

/** Index `i` is the UTF-16 *low/trail* surrogate (`s[i]` with `s[i-1]` high). Boundary at `i` would split one supplementary character. */
function isSurrogatePairLowIndex(s: string, i: number): boolean {
  if (i <= 0 || i >= s.length) return false;
  const hi = s.charCodeAt(i - 1);
  const lo = s.charCodeAt(i);
  return hi >= 0xd800 && hi <= 0xdbff && lo >= 0xdc00 && lo <= 0xdfff;
}

/** If split would occur, inclusive start snaps back one unit (−1), exclusive end one past pair (+1); else unchanged */
function snappedBoundary(i: number, s: string, deltaWhenLowIndex: -1 | 1): number {
  return isSurrogatePairLowIndex(s, i) ? i + deltaWhenLowIndex : i;
}

/** Inclusive start — take safest (leftmost) of both strings’ requirements */
function snapBoundaryStart(i: number, a: string, b: string): number {
  return Math.min(snappedBoundary(i, a, -1), snappedBoundary(i, b, -1));
}

/** Exclusive end — take widest (rightmost) so neither string’s pair is sliced */
function snapBoundaryEndExclusive(i: number, a: string, b: string): number {
  return Math.max(snappedBoundary(i, a, 1), snappedBoundary(i, b, 1));
}

/**
 * Coalesce overlapping or touching intervals into a minimal sorted, non-overlapping set.
 *
 * Algorithm: sort by (start asc, end asc), then sweep left-to-right maintaining one
 * "running" merged interval [curStart, curEnd]. Each input range either
 *   - overlaps/touches the running one (`next.start <= curEnd`) → extend curEnd, or
 *   - starts past it → flush the running interval to `out` and adopt `next` as new running.
 *
 * Touching counts as merging (`<=`, not `<`) because surrogate-boundary snapping can
 * produce abutting ranges that logically belong together — see `snapBoundary*` above.
 *
 * Subtlety: under (start asc, end asc), a later range can still end *before* curEnd
 * (e.g. [0,10] then [1,3]) — that's why the extend is guarded by `next.end > curEnd`
 * rather than an unconditional assignment.
 *
 * Does not mutate input.
 */
function mergeRanges(ranges: DiffRange[]): DiffRange[] {
  const n = ranges.length;
  if (n === 0) return [];

  // slice() copies (must not mutate caller's array) without the iterator-protocol
  // overhead of array spread.
  const sorted = ranges.slice().sort((x, y) => x.start - y.start || x.end - y.end);
  const out: DiffRange[] = [];

  // Running merged interval held as primitives — avoids per-iter object cloning.
  let curStart = sorted[0].start;
  let curEnd = sorted[0].end;

  for (let k = 1; k < n; k++) {
    const next = sorted[k];

    if (next.start <= curEnd) {
      if (next.end > curEnd) curEnd = next.end;
    } else {
      out.push({ start: curStart, end: curEnd });
      curStart = next.start;
      curEnd = next.end;
    }
  }

  // Loop only emits on a gap, so the final running interval is still un-flushed.
  out.push({ start: curStart, end: curEnd });

  return out;
}

/**
 * Greedy scan: at each index, compare UTF-16 units (or “missing” vs other string if lengths differ).
 * Contiguous differing indices become half-open ranges `[start,end)`; `diffCount` counts per index.
 * No surrogate handling — used as input to boundary snapping in `positionalDiff`.
 */
function positionalDiffUtf16(
  baseText: string,
  compareText: string
): PositionalDiffResult {
  const maxLen = Math.max(baseText.length, compareText.length);
  const ranges: DiffRange[] = [];
  let diffCount = 0;
  let rangeStart: number | null = null;

  for (let i = 0; i < maxLen; i++) {
    const u1 = i < baseText.length ? baseText.charCodeAt(i) : undefined;
    const u2 = i < compareText.length ? compareText.charCodeAt(i) : undefined;
    const differs = u1 !== u2;

    if (differs) {
      diffCount++;
      if (rangeStart === null) {
        rangeStart = i;
      }
    } else if (rangeStart !== null) {
      ranges.push({ start: rangeStart, end: i });
      rangeStart = null;
    }
  }

  if (rangeStart !== null) {
    ranges.push({ start: rangeStart, end: maxLen });
  }

  return { ranges, diffCount };
}

/**
 * Positional UTF-16 code-unit diff aligned with flattened `textContent`.
 * Adjacent surrogates are never split across range boundaries — safe for DOM `Range`.
 * Longer string tail differs per index versus “missing” shorter side.
 *
 * Pipeline: raw ranges → per-range start/end snap → merge → `diffCount` recomputed as total
 * differing code-unit positions (unchanged definition: same as scanning both strings).
 */
export function positionalDiff(
  baseText: string,
  compareText: string
): PositionalDiffResult {
  const { ranges: rawRanges } = positionalDiffUtf16(baseText, compareText);

  const snapped: DiffRange[] = [];
  for (const r of rawRanges) {
    const s = snapBoundaryStart(r.start, baseText, compareText);
    const e = snapBoundaryEndExclusive(r.end, baseText, compareText);
    if (s < e) {
      snapped.push({ start: s, end: e });
    }
  }

  const ranges = mergeRanges(snapped);

  let count = 0;
  const maxLen = Math.max(baseText.length, compareText.length);

  for (let i = 0; i < maxLen; i++) {
    const u1 = i < baseText.length ? baseText.charCodeAt(i) : undefined;
    const u2 = i < compareText.length ? compareText.charCodeAt(i) : undefined;
    if (u1 !== u2) count++;
  }

  return { ranges, diffCount: count };
}

/**
 * Default {@link DiffFn} — wraps {@link positionalDiff} into the per-side
 * `CustomDiffResult` shape used by the controller. Both sides reuse the same
 * ranges because flat offsets align (positional alignment).
 *
 * Exported for users wanting to fall back to positional inside their own
 * `DiffFn` (e.g. positional for short strings, LCS for long).
 */
export const positionalDiffFn: DiffFn = (
  baseText: string,
  compareText: string
): CustomDiffResult => {
  const { ranges, diffCount } = positionalDiff(baseText, compareText);
  return { baseRanges: ranges, compareRanges: ranges, diffCount };
};
