import {
  createTextRangeSlice,
  type TextMap,
  type TextMapSegment,
} from "../shared/dom";
import type { DiffRange } from "./types";

function findFirstOverlappingSegment(
  segments: TextMapSegment[],
  flatOffset: number
): number {
  let lo = 0;
  let hi = segments.length;

  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    const seg = segments[mid];
    if (seg.start + seg.length <= flatOffset) lo = mid + 1;
    else hi = mid;
  }

  return lo;
}

/**
 * Maps flat diff ranges to DOM Ranges inside `textMap`.
 * Uses binary search per diff range (`O(diff * log segs + overlaps)`).
 */
export function mapDiffToRanges(diffRanges: DiffRange[], textMap: TextMap): Range[] {
  const flatLen = textMap.text.length;
  const { segments } = textMap;

  if (flatLen === 0 || segments.length === 0) {
    return [];
  }

  const rangesOut: Range[] = [];

  for (const { start: dStart, end: dEnd } of diffRanges) {
    const clipStart = Math.max(0, dStart);
    const clipEnd = Math.min(flatLen, dEnd);
    if (clipStart >= clipEnd) continue;

    let i = findFirstOverlappingSegment(segments, clipStart);

    while (i < segments.length) {
      const seg = segments[i];
      if (seg.start >= clipEnd) break;

      const segEnd = seg.start + seg.length;
      const overlapStart = Math.max(clipStart, seg.start);
      const overlapEnd = Math.min(clipEnd, segEnd);

      if (overlapStart < overlapEnd) {
        const slice = createTextRangeSlice(
          seg.node,
          overlapStart - seg.start,
          overlapEnd - seg.start
        );

        if (slice) rangesOut.push(slice);
      }

      i++;
    }
  }

  return rangesOut;
}
