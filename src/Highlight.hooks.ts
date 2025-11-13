import { useEffect, useEffectEvent, useState } from "react";
import { DEFAULT_DEBOUNCE_MS, DEFAULT_MAX_HIGHLIGHTS } from "./Highlight.constants";
import type { HighlightProps, UseHighlightResult } from "./Highlight.types";
import {
  findTextMatches,
  isHighlightAPISupported,
  normalizeSearchTerms,
  registerHighlight,
  removeHighlight,
} from "./Highlight.utils";
import { useDebounce } from "./useDebounce";

export function useHighlight({
  search,
  targetRef,
  highlightName = "highlight",
  caseSensitive = false,
  wholeWord = false,
  maxHighlights = DEFAULT_MAX_HIGHLIGHTS,
  debounce = DEFAULT_DEBOUNCE_MS,
  ignoredTags,
  onHighlightChange,
  onError,
}: HighlightProps): UseHighlightResult {
  const [matchCount, setMatchCount] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const isSupported = isHighlightAPISupported();

  // Debounce search input to prevent excessive re-highlighting
  const debouncedSearch = useDebounce(search, debounce);

  // Extract callback handlers into effect events to avoid including them in dependencies
  // These always access the latest values without triggering effect re-runs
  const handleHighlightChange = useEffectEvent((count: number) => {
    onHighlightChange?.(count);
  });

  const handleError = useEffectEvent((err: Error) => {
    onError?.(err);
  });

  useEffect(() => {
    if (!isSupported) {
      const err = new Error("CSS Custom Highlight API is not supported");
      setError(err);
      handleError(err);
      return;
    }

    if (!targetRef.current) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "Highlight: targetRef.current is null. " +
            "Make sure the ref is attached to a DOM element."
        );
      }
      setMatchCount(0);
      return;
    }

    const searchTerms = normalizeSearchTerms(debouncedSearch);

    if (searchTerms.length === 0) {
      removeHighlight(highlightName);
      setMatchCount(0);
      handleHighlightChange(0);
      return;
    }

    try {
      // Use requestIdleCallback for better performance
      const idleCallback = requestIdleCallback(
        () => {
          try {
            const matches = findTextMatches(
              targetRef.current!,
              searchTerms,
              caseSensitive,
              wholeWord,
              maxHighlights,
              ignoredTags
            );

            const ranges = matches.map((match) => match.range);
            registerHighlight(highlightName, ranges);

            setMatchCount(matches.length);
            setError(null);
            handleHighlightChange(matches.length);
          } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
            handleError(error);
          }
        },
        { timeout: 100 }
      );

      return () => {
        cancelIdleCallback(idleCallback);
        removeHighlight(highlightName);
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      handleError(error);
    }
    // Effect events (handleHighlightChange, handleError) are NOT included in deps
    // They're stable references that always access latest callback values without triggering re-runs
  }, [
    debouncedSearch,
    targetRef,
    highlightName,
    caseSensitive,
    wholeWord,
    maxHighlights,
    ignoredTags,
    isSupported,
  ]);

  return {
    matchCount,
    isSupported,
    error,
  };
}
