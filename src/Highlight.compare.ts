/**
 * Positional string comparison highlighting via CSS Custom Highlight API.
 */

import { IGNORED_TAG_NAMES } from "./Highlight.constants";
import {
  isHighlightAPISupported,
  registerHighlight,
  removeHighlight,
} from "./Highlight.utils";

/**
 * Segment of flattened text originating from one text node
 */
export interface TextMapSegment {
  node: Node;
  /** Flattened string offset where this segment starts */
  start: number;
  /** Character length (`node.textContent` length; may be 0) */
  length: number;
}

/** Result of flattening an element's text into a plain string plus node spans */
export interface TextMap {
  text: string;
  segments: TextMapSegment[];
}

export interface DiffRange {
  /** Inclusive flat index where diff begins */
  start: number;
  /** Exclusive flat index after last differing character */
  end: number;
}

/** Result of positional character comparison between two strings */
export interface PositionalDiffResult {
  /** Grouped contiguous diff ranges over flat coordinates (exclusive `end`) */
  ranges: DiffRange[];
  /** Number of differing character positions (counts each index separately) */
  diffCount: number;
}

/** Options for `createCompareHighlight` */
export interface CompareOptions {
  /** CSS highlight name for the base/reference element */
  baseHighlightName?: string;
  /** CSS highlight name for the compare/other element */
  compareHighlightName?: string;
  /** Extra parent tag names whose text descendants are skipped (merged with defaults) */
  ignoredTags?: string[];
  /** Fired synchronously after each compare with differing character count */
  onDiffChange?: (diffCount: number) => void;
  onError?: (error: Error) => void;
}

type ResolvedCompareOptions = CompareOptions & {
  baseHighlightName: string;
  compareHighlightName: string;
  ignoredTags: string[];
  onDiffChange: (diffCount: number) => void;
  onError: (error: Error) => void;
};

/** Controller for compare highlights */
export interface CompareController {
  /** Number of differing character positions after last synchronous compare */
  readonly diffCount: number;
  update(options: Partial<CompareOptions>): void;
  refresh(): void;
  destroy(): void;
}

function normalizeIgnoredTags(ignoredTags?: string[]): string[] {
  return [...IGNORED_TAG_NAMES, ...(ignoredTags || [])].map((tag) =>
    tag.toUpperCase()
  );
}

/**
 * Builds a flattened text representation of an element and maps flat indices back to DOM text nodes.
 * Includes whitespace-only segments (positional compare must preserve alignment).
 */
export function buildTextMap(element: HTMLElement, ignoredTags?: string[]): TextMap {
  const normalizedIgnoredTags = normalizeIgnoredTags(ignoredTags);
  let text = "";

  function acceptNode(node: Node): number {
    const parent = node.parentElement;
    if (!parent) {
      return NodeFilter.FILTER_REJECT;
    }
    if (normalizedIgnoredTags.includes(parent.tagName)) {
      return NodeFilter.FILTER_REJECT;
    }
    return NodeFilter.FILTER_ACCEPT;
  }

  const segments: TextMapSegment[] = [];
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
    acceptNode,
  });

  let currentNode: Node | null = walker.currentNode;
  while (currentNode !== null) {
    if (currentNode.nodeType === Node.TEXT_NODE) {
      const content = currentNode.textContent ?? "";
      const start = text.length;
      text += content;
      segments.push({ node: currentNode, start, length: content.length });
    }
    currentNode = walker.nextNode();
  }

  return { text, segments };
}

/**
 * Positional UTF-16 code-unit diff aligned with flattened `textContent`.
 * Longer string tail differs from "missing" on the shorter side per index.
 */
export function positionalDiff(
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

function createSliceRange(
  node: Node,
  startOffset: number,
  endOffset: number
): Range | null {
  try {
    const range = document.createRange();
    range.setStart(node, startOffset);
    range.setEnd(node, endOffset);
    return range;
  } catch {
    return null;
  }
}

/**
 * Maps flat diff ranges to DOM Ranges inside `textMap`, clipped to flattened length.
 */
export function mapDiffToRanges(diffRanges: DiffRange[], textMap: TextMap): Range[] {
  const flatLen = textMap.text.length;
  if (flatLen === 0) {
    return [];
  }

  const rangesOut: Range[] = [];

  for (const { start: dStart, end: dEnd } of diffRanges) {
    const clipStart = Math.max(0, dStart);
    const clipEnd = Math.min(flatLen, dEnd);
    if (clipStart >= clipEnd) {
      continue;
    }

    for (const seg of textMap.segments) {
      const segEnd = seg.start + seg.length;
      const overlapStart = Math.max(clipStart, seg.start);
      const overlapEnd = Math.min(clipEnd, segEnd);
      if (overlapStart >= overlapEnd) {
        continue;
      }

      const relStart = overlapStart - seg.start;
      const relEnd = overlapEnd - seg.start;
      const slice = createSliceRange(seg.node, relStart, relEnd);
      if (slice) {
        rangesOut.push(slice);
      }
    }
  }

  return rangesOut;
}

const NOOP_CONTROLLER: CompareController = {
  get diffCount() {
    return 0;
  },
  update() {},
  refresh() {},
  destroy() {},
};

/**
 * Highlights positional differences between two elements' flattened text via CSS highlights.
 */
export function createCompareHighlight(
  baseElement: HTMLElement,
  compareElement: HTMLElement,
  options: CompareOptions = {}
): CompareController {
  if (!baseElement || !compareElement) {
    throw new Error(
      "createCompareHighlight: baseElement and compareElement are required"
    );
  }

  if (!isHighlightAPISupported()) {
    const err = new Error(
      "CSS Custom Highlight API is not supported in this browser"
    );
    options.onError?.(err);
    return NOOP_CONTROLLER;
  }

  let idleCallbackId: number | null = null;
  let diffCount = 0;

  let currentOptions: ResolvedCompareOptions = {
    baseHighlightName: options.baseHighlightName ?? "highlight-diff-base",
    compareHighlightName: options.compareHighlightName ?? "highlight-diff-compare",
    ignoredTags: options.ignoredTags ?? [],
    onDiffChange: options.onDiffChange ?? (() => {}),
    onError: options.onError ?? (() => {}),
  };

  let baseInstanceId = Symbol("compare-highlight-base");
  let compareInstanceId = Symbol("compare-highlight-compare");

  function cancelPending(): void {
    if (idleCallbackId !== null) {
      cancelIdleCallback(idleCallbackId);
      idleCallbackId = null;
    }
  }

  function scheduleCompare(): void {
    cancelPending();

    try {
      const baseMap = buildTextMap(baseElement, currentOptions.ignoredTags);
      const compareMap = buildTextMap(compareElement, currentOptions.ignoredTags);
      const { ranges, diffCount: count } = positionalDiff(
        baseMap.text,
        compareMap.text
      );
      diffCount = count;
      currentOptions.onDiffChange(diffCount);

      if (diffCount === 0) {
        try {
          removeHighlight(currentOptions.baseHighlightName, baseInstanceId);
          removeHighlight(currentOptions.compareHighlightName, compareInstanceId);
        } catch (e) {
          const err = e instanceof Error ? e : new Error(String(e));
          currentOptions.onError(err);
        }
        return;
      }

      const baseRanges = mapDiffToRanges(ranges, baseMap);
      const compareRanges = mapDiffToRanges(ranges, compareMap);

      idleCallbackId = requestIdleCallback(
        () => {
          idleCallbackId = null;
          try {
            baseInstanceId = registerHighlight(
              currentOptions.baseHighlightName,
              baseRanges,
              baseInstanceId
            );
            compareInstanceId = registerHighlight(
              currentOptions.compareHighlightName,
              compareRanges,
              compareInstanceId
            );
          } catch (e) {
            const err = e instanceof Error ? e : new Error(String(e));
            currentOptions.onError(err);
            removeHighlight(currentOptions.baseHighlightName, baseInstanceId);
            removeHighlight(currentOptions.compareHighlightName, compareInstanceId);
            diffCount = 0;
            currentOptions.onDiffChange(0);
          }
        },
        { timeout: 100 }
      );
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      currentOptions.onError(err);
      removeHighlight(currentOptions.baseHighlightName, baseInstanceId);
      removeHighlight(currentOptions.compareHighlightName, compareInstanceId);
      diffCount = 0;
      currentOptions.onDiffChange(0);
    }
  }

  scheduleCompare();

  return {
    get diffCount() {
      return diffCount;
    },

    update(newOptions: Partial<CompareOptions>) {
      const oldBaseName = currentOptions.baseHighlightName;
      const oldCompareName = currentOptions.compareHighlightName;

      currentOptions = {
        ...currentOptions,
        ...newOptions,
        baseHighlightName:
          newOptions.baseHighlightName ?? currentOptions.baseHighlightName,
        compareHighlightName:
          newOptions.compareHighlightName ?? currentOptions.compareHighlightName,
        ignoredTags: newOptions.ignoredTags ?? currentOptions.ignoredTags,
        onDiffChange: newOptions.onDiffChange ?? currentOptions.onDiffChange,
        onError: newOptions.onError ?? currentOptions.onError,
      };

      if (currentOptions.baseHighlightName !== oldBaseName) {
        removeHighlight(oldBaseName, baseInstanceId);
        baseInstanceId = Symbol("compare-highlight-base");
      }
      if (currentOptions.compareHighlightName !== oldCompareName) {
        removeHighlight(oldCompareName, compareInstanceId);
        compareInstanceId = Symbol("compare-highlight-compare");
      }

      scheduleCompare();
    },

    refresh() {
      scheduleCompare();
    },

    destroy() {
      cancelPending();
      removeHighlight(currentOptions.baseHighlightName, baseInstanceId);
      removeHighlight(currentOptions.compareHighlightName, compareInstanceId);
      diffCount = 0;
      currentOptions.onDiffChange(0);
    },
  };
}
