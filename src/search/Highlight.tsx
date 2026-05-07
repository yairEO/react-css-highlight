import type { HighlightProps } from "./reactTypes";
import { useHighlight } from "./useHighlight";

export { useHighlight } from "./useHighlight";

/**
 * Highlights search terms inside `targetRef` via CSS Custom Highlight API.
 *
 * @see {@link useHighlight}
 */
export default function Highlight(props: HighlightProps) {
  const { matchCount, isSupported, error } = useHighlight(props);

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
    if (matchCount > 0 && isSupported && !error) {
      // optional dev logging
    }
  }

  return null;
}
