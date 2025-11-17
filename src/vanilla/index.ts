/**
 * Vanilla JavaScript API for text highlighting using CSS Custom Highlight API
 *
 * This module provides a framework-agnostic interface for highlighting text in the DOM.
 * Use this for vanilla JS, Vue, Svelte, Angular, or any non-React projects.
 *
 * @example
 * ```js
 * import { createHighlight } from 'react-css-highlight/vanilla';
 *
 * const controller = createHighlight(document.body, {
 *   search: 'error',
 *   highlightName: 'highlight-error'
 * });
 *
 * console.log(`Found ${controller.matchCount} matches`);
 * controller.destroy();
 * ```
 */

// Import utility functions for use within this module
import {
  findTextMatches,
  isHighlightAPISupported,
  normalizeSearchTerms,
  registerHighlight,
  removeHighlight,
} from "../Highlight.utils";

// Re-export constants
export {
  DEFAULT_DEBOUNCE_MS,
  DEFAULT_MAX_HIGHLIGHTS,
  IGNORED_TAG_NAMES,
  SLOW_SEARCH_THRESHOLD_MS,
} from "../Highlight.constants";
// Re-export pure types (non-React)
export type { HighlightMatch } from "../Highlight.types";
// Re-export utility functions
export {
  findTextMatches,
  isHighlightAPISupported,
  normalizeSearchTerms,
  registerHighlight,
  removeHighlight,
} from "../Highlight.utils";

/**
 * Options for creating a highlight
 */
export interface HighlightOptions {
  /** String or array of strings to highlight */
  search: string | string[];

  /** Custom highlight name for CSS ::highlight() pseudo-element (default: "highlight") */
  highlightName?: string;

  /** Case-sensitive search (default: false) */
  caseSensitive?: boolean;

  /** Match whole words only (default: false) */
  wholeWord?: boolean;

  /** Maximum number of highlights to prevent performance issues (default: 1000) */
  maxHighlights?: number;

  /** HTML elements whose text content should not be highlighted */
  ignoredTags?: string[];

  /** Callback when highlights are updated */
  onHighlightChange?: (matchCount: number) => void;

  /** Callback when error occurs */
  onError?: (error: Error) => void;
}

/**
 * Internal type with all optional properties resolved to their defaults
 */
type ResolvedHighlightOptions = HighlightOptions & {
  highlightName: string;
  caseSensitive: boolean;
  wholeWord: boolean;
  maxHighlights: number;
  ignoredTags: string[];
  onHighlightChange: (count: number) => void;
  onError: (error: Error) => void;
};

/**
 * Controller interface returned by createHighlight
 */
export interface HighlightController {
  /** Number of matches found */
  readonly matchCount: number;

  /** Update highlight with new options */
  update(options: Partial<HighlightOptions>): void;

  /** Remove all highlights and cleanup */
  destroy(): void;
}

/**
 * Creates a highlight on the specified element with the given options.
 * Returns a controller for managing the highlight lifecycle.
 *
 * @param element - DOM element to search within
 * @param options - Highlight configuration options
 * @returns Controller object for managing the highlight
 *
 * @example
 * ```js
 * // Basic usage
 * const ctrl = createHighlight(document.body, {
 *   search: 'important',
 *   highlightName: 'highlight-warning'
 * });
 *
 * // Update search term
 * ctrl.update({ search: 'critical' });
 *
 * // Cleanup when done
 * ctrl.destroy();
 * ```
 *
 * @example
 * ```js
 * // Multiple search terms with callbacks
 * const ctrl = createHighlight(contentElement, {
 *   search: ['error', 'warning', 'critical'],
 *   caseSensitive: false,
 *   wholeWord: true,
 *   onHighlightChange: (count) => {
 *     console.log(`Found ${count} matches`);
 *   },
 *   onError: (err) => {
 *     console.error('Highlight error:', err);
 *   }
 * });
 * ```
 */
export function createHighlight(
  element: HTMLElement,
  options: HighlightOptions
): HighlightController {
  if (!element) {
    throw new Error("createHighlight: HTMLElement parameter is required");
  }

  if (!options) {
    throw new Error("createHighlight: options parameter is required");
  }

  // Validate search - must be non-empty string or non-empty array
  const normalizedSearch = Array.isArray(options.search)
    ? options.search.filter((t) => t && t.trim().length > 0)
    : [options.search].filter((t) => t && t.trim().length > 0);

  if (normalizedSearch.length === 0) {
    throw new Error(
      "createHighlight: options.search must be a non-empty string or array with at least one non-empty string"
    );
  }

  if (!isHighlightAPISupported()) {
    const error = new Error("CSS Custom Highlight API is not supported in this browser");
    options.onError?.(error);

    // Return a no-op controller for unsupported browsers
    return {
      matchCount: 0,
      update: () => {},
      destroy: () => {},
    };
  }

  // Merge with defaults
  let currentOptions: ResolvedHighlightOptions = {
    search: options.search,
    highlightName: options.highlightName || "highlight",
    caseSensitive: options.caseSensitive ?? false,
    wholeWord: options.wholeWord ?? false,
    maxHighlights: options.maxHighlights ?? 1000,
    ignoredTags: options.ignoredTags ?? [],
    onHighlightChange: options.onHighlightChange ?? (() => {}),
    onError: options.onError ?? (() => {}),
  };

  let matchCount = 0;

  /**
   * Apply highlights based on current options
   */
  function applyHighlights(): void {
    try {
      const searchTerms = normalizeSearchTerms(currentOptions.search);

      if (searchTerms.length === 0) {
        // Clear existing highlights if no search terms
        removeHighlight(currentOptions.highlightName);
        matchCount = 0;
        currentOptions.onHighlightChange(matchCount);
        return;
      }

      // Find all matches
      const matches = findTextMatches(
        element,
        searchTerms,
        currentOptions.caseSensitive,
        currentOptions.wholeWord,
        currentOptions.maxHighlights,
        currentOptions.ignoredTags
      );

      // Register with CSS.highlights
      const ranges = matches.map((m) => m.range);
      registerHighlight(currentOptions.highlightName, ranges);

      matchCount = matches.length;
      currentOptions.onHighlightChange(matchCount);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      currentOptions.onError(err);
    }
  }

  // Initial highlight
  applyHighlights();

  // Return controller
  return {
    get matchCount() {
      return matchCount;
    },

    update(newOptions: Partial<HighlightOptions>) {
      // Validate search if provided (allow empty array to clear highlights)
      if (newOptions.search !== undefined) {
        if (Array.isArray(newOptions.search)) {
          // Empty array is valid (clears highlights)
          const hasValidTerms = newOptions.search.some((t) => t && t.trim().length > 0);
          if (newOptions.search.length > 0 && !hasValidTerms) {
            throw new Error(
              "createHighlight.update: options.search array contains only empty strings"
            );
          }
        } else if (!newOptions.search || !newOptions.search.trim()) {
          throw new Error("createHighlight.update: options.search cannot be an empty string");
        }
      }

      // Remove old highlight if name changed
      if (newOptions.highlightName && newOptions.highlightName !== currentOptions.highlightName) {
        removeHighlight(currentOptions.highlightName);
      }

      // Merge new options (spread preserves current values for undefined properties)
      currentOptions = {
        ...currentOptions,
        ...newOptions,
      } as ResolvedHighlightOptions;

      // Re-apply highlights
      applyHighlights();
    },

    destroy() {
      removeHighlight(currentOptions.highlightName);
      matchCount = 0;
    },
  };
}

