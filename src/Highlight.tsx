import { useHighlight } from "./Highlight.hooks";
import type { HighlightProps } from "./Highlight.types";
import "./Highlight.css";

/**
 * Highlight component using CSS Custom Highlight API
 *
 * This component highlights search terms within a target element using the modern
 * CSS Custom Highlight API and TreeWalker for efficient text traversal.
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
export default function Highlight(props: HighlightProps) {
  const { matchCount, isSupported, error } = useHighlight(props);

  // Component doesn't render anything - it only manages highlights via CSS.highlights API
  if (process.env.NODE_ENV === "development") {
    if (!isSupported) {
      console.warn(
        "Highlight: CSS Custom Highlight API is not supported in this browser. " +
          "Check browser compatibility: https://caniuse.com/mdn-api_highlight"
      );
    }
    if (error) {
      console.error("Highlight error:", error);
    }
    if (matchCount > 0) {
      // console.log(`Highlight: Found ${matchCount} matches for "${props.search}"`);
    }
    if (matchCount === 0 && props.search && isSupported && !error) {
      // console.log(`Highlight: No matches found for "${props.search}"`);
    }
  }

  return null;
}
