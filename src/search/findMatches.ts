import {
  DEFAULT_MAX_HIGHLIGHTS,
  SLOW_SEARCH_THRESHOLD_MS,
} from "../shared/constants";
import {
  createTextNodeFilter,
  createTextRangeSlice,
  normalizeIgnoredTags,
} from "../shared/dom";
import type { HighlightMatch } from "./types";

const __DEV__ = process.env.NODE_ENV === "development";

function escapeRegex(str: string): string {
  const trimmed = str.trim();
  if (!trimmed) {
    throw new Error("escapeRegex: empty or whitespace-only string provided");
  }
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function createSearchPattern(
  searchTerm: string,
  caseSensitive: boolean,
  wholeWord: boolean
): RegExp {
  const escaped = escapeRegex(searchTerm);
  const pattern = wholeWord ? `\\b${escaped}\\b` : escaped;
  const flags = caseSensitive ? "g" : "gi";
  const regex = new RegExp(pattern, flags);

  if (regex.test("")) {
    throw new Error(
      `Invalid search pattern: "${searchTerm}" would match empty string`
    );
  }

  return regex;
}

function compileSearchPatterns(
  searchTerms: string[],
  caseSensitive: boolean,
  wholeWord: boolean
): Array<{ term: string; pattern: RegExp }> {
  return searchTerms
    .filter((term) => term && term.trim().length > 0)
    .map((term) => {
      try {
        return {
          term,
          pattern: createSearchPattern(term, caseSensitive, wholeWord),
        };
      } catch (error) {
        if (__DEV__) {
          console.warn(`[Highlight] Invalid search term: "${term}"`, error);
        }
        return null;
      }
    })
    .filter((item): item is { term: string; pattern: RegExp } => item !== null);
}

function isValidTextNode(node: Node): boolean {
  if (node.nodeType !== Node.TEXT_NODE) return false;
  const textContent = node.textContent || "";
  return textContent.trim().length > 0;
}

function logSlowSearch(
  startTime: number,
  matchCount: number,
  termCount: number
): void {
  if (!__DEV__ || !startTime) return;

  const duration = performance.now() - startTime;
  if (duration > SLOW_SEARCH_THRESHOLD_MS) {
    console.warn(
      `[Highlight] Slow search detected: ${duration.toFixed(2)}ms for ${matchCount} matches across ${termCount} terms`
    );
  }
}

function findAllPatternMatchesInNode(
  textNode: Node,
  pattern: RegExp,
  searchTerm: string,
  globalMatchIndex: number,
  remainingQuota: number
): HighlightMatch[] {
  const matches: HighlightMatch[] = [];
  const textContent = textNode.textContent || "";

  pattern.lastIndex = 0;

  let match = pattern.exec(textContent);
  let matchCount = 0;

  while (match !== null && matchCount < remainingQuota) {
    const startOffset = match.index;
    const endOffset = startOffset + match[0].length;
    const range = createTextRangeSlice(textNode, startOffset, endOffset);

    if (range) {
      matches.push({
        text: match[0],
        range,
        index: globalMatchIndex + matchCount,
        searchTerm,
      });

      matchCount++;
    }

    match = pattern.exec(textContent);
  }

  return matches;
}

function findPatternMatchesInTree(
  targetElement: HTMLElement,
  pattern: RegExp,
  searchTerm: string,
  normalizedIgnoredTags: string[],
  currentMatchCount: number,
  maxHighlights: number
): HighlightMatch[] {
  const matches: HighlightMatch[] = [];
  let totalMatches = currentMatchCount;

  const walker = document.createTreeWalker(targetElement, NodeFilter.SHOW_TEXT, {
    acceptNode: createTextNodeFilter(normalizedIgnoredTags),
  });

  let currentNode: Node | null = walker.currentNode;

  while (currentNode && totalMatches < maxHighlights) {
    if (!isValidTextNode(currentNode)) {
      currentNode = walker.nextNode();
      continue;
    }

    const remainingQuota = maxHighlights - totalMatches;
    const nodeMatches = findAllPatternMatchesInNode(
      currentNode,
      pattern,
      searchTerm,
      totalMatches,
      remainingQuota
    );

    matches.push(...nodeMatches);
    totalMatches += nodeMatches.length;

    currentNode = walker.nextNode();
  }

  return matches;
}

export function normalizeSearchTerms(search: string | string[]): string[] {
  return [search].flat().filter((t) => t?.trim?.());
}

/**
 * Find all text matches in `targetElement` using TreeWalker.
 */
export function findTextMatches(
  targetElement: HTMLElement,
  searchTerms: string[],
  caseSensitive = false,
  wholeWord = false,
  maxHighlights = DEFAULT_MAX_HIGHLIGHTS,
  ignoredTags?: string[]
): HighlightMatch[] {
  const startTime = __DEV__ ? performance.now() : 0;
  const normalizedIgnoredTags = normalizeIgnoredTags(ignoredTags);
  const patterns = compileSearchPatterns(searchTerms, caseSensitive, wholeWord);

  if (patterns.length === 0) {
    return [];
  }

  const matches: HighlightMatch[] = [];
  let totalMatches = 0;

  for (const { term, pattern } of patterns) {
    if (totalMatches >= maxHighlights) break;

    const patternMatches = findPatternMatchesInTree(
      targetElement,
      pattern,
      term,
      normalizedIgnoredTags,
      totalMatches,
      maxHighlights
    );

    matches.push(...patternMatches);
    totalMatches += patternMatches.length;
  }

  logSlowSearch(startTime, totalMatches, searchTerms.length);
  return matches;
}
