import { IGNORED_TAG_NAMES } from "./constants";

/** True when browser globals exist (not SSR-only) */
export function isBrowser(): boolean {
  return (
    typeof document !== "undefined" &&
    typeof window !== "undefined" &&
    typeof document.createTreeWalker === "function"
  );
}

/** Normalizes and merges ignored tag names (uppercase) */
export function normalizeIgnoredTags(ignoredTags?: string[]): string[] {
  return [...IGNORED_TAG_NAMES, ...(ignoredTags ?? [])].map((tag) =>
    tag.toUpperCase()
  );
}

/**
 * Creates a Range for a substring of a single text node
 * @returns Range or null if offsets invalid for the node
 */
export function createTextRangeSlice(
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

/** TreeWalker filter: reject text nodes under ignored parents */
export function createTextNodeFilter(
  normalizedIgnoredTags: string[]
): (node: Node) => number {
  return (node: Node): number => {
    const parent = node.parentElement;
    if (!parent) return NodeFilter.FILTER_REJECT;
    if (normalizedIgnoredTags.includes(parent.tagName)) {
      return NodeFilter.FILTER_REJECT;
    }
    return NodeFilter.FILTER_ACCEPT;
  };
}

/**
 * Segment of flattened text originating from one text node.
 * `length` cached for O(1) overlap in {@link mapDiffToRanges} (equals `node.textContent.length`).
 */
export interface TextMapSegment {
  node: Node;
  /** Flattened string offset where this segment starts */
  start: number;
  /** UTF-16 code units in this segment (may be 0) */
  length: number;
}

/** Flattened text plus segments mapping flat indices to nodes */
export interface TextMap {
  text: string;
  segments: TextMapSegment[];
}

/**
 * Builds flattened text for an element; maps flat indices back to DOM text nodes.
 * Preserves whitespace-only segments for positional alignment.
 */
export function buildTextMap(element: HTMLElement, ignoredTags?: string[]): TextMap {
  const normalizedIgnoredTags = normalizeIgnoredTags(ignoredTags);
  let text = "";

  function acceptNode(node: Node): number {
    const parent = node.parentElement;
    if (!parent) return NodeFilter.FILTER_REJECT;
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
