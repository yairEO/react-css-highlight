import {
  DEFAULT_MAX_HIGHLIGHTS,
  IGNORED_TAG_NAMES,
  SLOW_SEARCH_THRESHOLD_MS,
} from "./Highlight.constants";
import type { HighlightMatch } from "./Highlight.types";

// Development mode flag for performance logging (tree-shaken in production)
const __DEV__ = process.env.NODE_ENV === "development";

/**
 * Check if CSS Custom Highlight API is supported
 */
export function isHighlightAPISupported(): boolean {
  return typeof CSS !== "undefined" && "highlights" in CSS;
}

/**
 * Escapes special regex characters in a string
 * @private
 * @param str - String to escape
 * @returns Escaped string safe for use in RegExp
 * @throws {Error} If string is empty or whitespace-only
 */
function escapeRegex(str: string): string {
  const trimmed = str.trim();
  if (!trimmed) {
    throw new Error("escapeRegex: empty or whitespace-only string provided");
  }
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Creates a regex pattern from search term with validation
 * @private
 * @param searchTerm - Term to search for
 * @param caseSensitive - Whether search should be case-sensitive
 * @param wholeWord - Whether to match whole words only
 * @returns Compiled RegExp pattern
 * @throws {Error} If pattern would match empty strings
 */
function createSearchPattern(
  searchTerm: string,
  caseSensitive: boolean,
  wholeWord: boolean
): RegExp {
  const escaped = escapeRegex(searchTerm);
  const pattern = wholeWord ? `\\b${escaped}\\b` : escaped;
  const flags = caseSensitive ? "g" : "gi";
  const regex = new RegExp(pattern, flags);

  // Validate pattern doesn't match empty string (could cause infinite loop)
  if (regex.test("")) {
    throw new Error(
      `Invalid search pattern: "${searchTerm}" would match empty string`
    );
  }

  return regex;
}

/**
 * Compiles search terms into regex patterns with validation
 * @private
 * @param searchTerms - Array of terms to search for
 * @param caseSensitive - Whether search should be case-sensitive
 * @param wholeWord - Whether to match whole words only
 * @returns Array of compiled patterns with their original terms
 */
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

/**
 * Creates a TreeWalker node filter that accepts text nodes and rejects ignored tags
 * @private
 * @param ignoredTags - Array of uppercase tag names to ignore
 * @returns NodeFilter acceptNode function
 */
function createTextNodeFilter(ignoredTags: string[]): (node: Node) => number {
  return (node: Node): number => {
    // Check if node has a parent element
    const parent = node.parentElement;
    if (!parent) {
      return NodeFilter.FILTER_REJECT;
    }

    // Skip script, style, and other non-content elements
    const tagName = parent.tagName;
    if (ignoredTags.includes(tagName)) {
      return NodeFilter.FILTER_REJECT;
    }

    return NodeFilter.FILTER_ACCEPT;
  };
}

/**
 * Creates a Range object for a text match with error handling
 * @private
 * @param node - Text node containing the match
 * @param startOffset - Start offset within the text node
 * @param endOffset - End offset within the text node
 * @returns Range object or null if creation failed
 */
function createMatchRange(
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
    // Skip invalid ranges silently
    return null;
  }
}

/**
 * Normalizes and merges ignored tag names
 * @private
 * @param ignoredTags - Optional array of additional tag names to ignore
 * @returns Array of uppercase tag names
 */
function normalizeIgnoredTags(ignoredTags?: string[]): string[] {
  return [...IGNORED_TAG_NAMES, ...(ignoredTags || [])].map((tag) =>
    tag.toUpperCase()
  );
}

/**
 * Validates if a node is a non-empty text node
 * @private
 * @param node - Node to validate
 * @returns True if node is a valid text node with content
 */
function isValidTextNode(node: Node): boolean {
  if (node.nodeType !== Node.TEXT_NODE) {
    return false;
  }

  const textContent = node.textContent || "";
  return textContent.trim().length > 0;
}

/**
 * Logs a warning if search took too long (development only)
 * @private
 * @param startTime - Performance timestamp from when search started
 * @param matchCount - Number of matches found
 * @param termCount - Number of search terms processed
 */
function logSlowSearch(
  startTime: number,
  matchCount: number,
  termCount: number
): void {
  if (!__DEV__ || !startTime) {
    return;
  }

  const duration = performance.now() - startTime;
  if (duration > SLOW_SEARCH_THRESHOLD_MS) {
    console.warn(
      `[Highlight] Slow search detected: ${duration.toFixed(2)}ms for ${matchCount} matches across ${termCount} terms`
    );
  }
}

/**
 * Finds all pattern matches within a single text node
 * @private
 * @param textNode - Text node to search within
 * @param pattern - Compiled regex pattern to match
 * @param searchTerm - Original search term for match metadata
 * @param globalMatchIndex - Current global match count across all nodes
 * @param remainingQuota - Number of additional matches allowed before hitting max
 * @returns Array of highlight matches found in this node
 */
function findAllPatternMatchesInNode(
  textNode: Node,
  pattern: RegExp,
  searchTerm: string,
  globalMatchIndex: number,
  remainingQuota: number
): HighlightMatch[] {
  const matches: HighlightMatch[] = [];
  const textContent = textNode.textContent || "";

  // Reset regex lastIndex
  pattern.lastIndex = 0;

  let match = pattern.exec(textContent);
  let matchCount = 0;

  while (match !== null && matchCount < remainingQuota) {
    const startOffset = match.index;
    const endOffset = startOffset + match[0].length;
    const range = createMatchRange(textNode, startOffset, endOffset);

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

/**
 * Searches through DOM tree using TreeWalker to find all matches for a single pattern
 * @private
 * @param targetElement - DOM element to search within
 * @param pattern - Compiled regex pattern to match
 * @param searchTerm - Original search term for match metadata
 * @param normalizedIgnoredTags - Array of uppercase tag names to ignore
 * @param currentMatchCount - Current total match count
 * @param maxHighlights - Maximum total matches allowed
 * @returns Array of matches found for this pattern
 */
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

/**
 * Find all text matches in the target element using TreeWalker
 *
 * @param targetElement - DOM element to search within
 * @param searchTerms - Array of terms to search for
 * @param caseSensitive - Whether search should be case-sensitive
 * @param wholeWord - Whether to match whole words only
 * @param maxHighlights - Maximum number of highlights to prevent performance issues
 * @returns Array of highlight matches with ranges
 */
export function findTextMatches(
  targetElement: HTMLElement,
  searchTerms: string[],
  caseSensitive = false,
  wholeWord = false,
  maxHighlights = DEFAULT_MAX_HIGHLIGHTS,
  ignoredTags?: string[]
): HighlightMatch[] {
  // Setup
  const startTime = __DEV__ ? performance.now() : 0;
  const normalizedIgnoredTags = normalizeIgnoredTags(ignoredTags);
  const patterns = compileSearchPatterns(searchTerms, caseSensitive, wholeWord);

  if (patterns.length === 0) {
    return [];
  }

  // Search through all patterns and collect matches
  const matches: HighlightMatch[] = [];
  let totalMatches = 0;

  for (const { term, pattern } of patterns) {
    if (totalMatches >= maxHighlights) {
      break;
    }

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

  // Log performance and return
  logSlowSearch(startTime, totalMatches, searchTerms.length);
  return matches;
}

/**
 * Register highlights with CSS.highlights API
 */
export function registerHighlight(highlightName: string, ranges: Range[]): void {
  if (!isHighlightAPISupported()) {
    return;
  }

  const highlight = new Highlight(...ranges);
  CSS.highlights.set(highlightName, highlight);
}

/**
 * Remove highlight from CSS.highlights API
 */
export function removeHighlight(highlightName: string): void {
  if (!isHighlightAPISupported()) {
    return;
  }

  CSS.highlights.delete(highlightName);
}

/**
 * Normalize search terms to array
 */
export function normalizeSearchTerms(search: string | string[]): string[] {
  return [search].flat().filter(t => t.trim());
}
