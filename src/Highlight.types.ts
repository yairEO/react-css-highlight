import type { ReactNode, RefObject } from "react";

export interface HighlightProps {
  /** String or array of strings to highlight */
  search: string | string[];

  /**
   * Ref to the target element to search within.
   *
   * @example
   * ```tsx
   * const contentRef = useRef<HTMLDivElement>(null);
   *
   * return (
   *   <>
   *     <Highlight search="error" targetRef={contentRef} />
   *     <div ref={contentRef}>
   *       This is an error message with error text.
   *     </div>
   *   </>
   * );
   * ```
   */
  targetRef: RefObject<HTMLElement | null>;

  /**
   * Custom highlight name for CSS ::highlight() pseudo-element.
   * Uses predefined styles from Highlight.css (highlight, highlight-error, highlight-warning, etc.)
   *
   * @default "highlight"
   */
  highlightName?: string;

  /** Case-sensitive search (default: false) */
  caseSensitive?: boolean;

  /** Match whole words only (default: false) */
  wholeWord?: boolean;

  /** Maximum number of highlights to prevent performance issues (default: 1000) */
  maxHighlights?: number;

  /**
   * Debounce delay in milliseconds before updating highlights.
   * Useful for performance when search terms change frequently (e.g., on user input).
   *
   * @default 100
   * @example
   * ```tsx
   * // Wait 300ms after user stops typing before highlighting
   * <Highlight search={searchTerm} debounce={300} targetRef={ref} />
   *
   * // No debounce - update immediately
   * <Highlight search={searchTerm} debounce={0} targetRef={ref} />
   * ```
   */
  debounce?: number;

  /** HTML elements whose text content should not be highlighted */
  ignoredTags?: string[];

  /** Callback when highlights are updated */
  onHighlightChange?: (matchCount: number) => void;

  /** Callback when error occurs */
  onError?: (error: Error) => void;
}

export interface HighlightMatch {
  text: string;
  range: Range;
  index: number;
  searchTerm: string;
}

export interface UseHighlightResult {
  matchCount: number;
  isSupported: boolean;
  error: Error | null;
}

/**
 * Props for HighlightWrapper convenience component
 * Combines HighlightProps with children support
 */
export interface HighlightWrapperProps extends Omit<HighlightProps, "targetRef"> {
  /**
   * Single React element to search within and highlight.
   * Must be a valid element that accepts a ref prop.
   */
  children: ReactNode;
}
