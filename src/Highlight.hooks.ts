import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react";
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

  // Create stable instance ID for this component
  const instanceIdRef = useRef<symbol | undefined>(undefined);
  if (!instanceIdRef.current) {
    instanceIdRef.current = Symbol("highlight-instance");
  }

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

  // Track pending idle callback to allow cancellation
  const idleCallbackRef = useRef<number | null>(null);

  // Extract highlight logic into reusable function
  const performHighlight = useCallback(() => {
    // 1. Validate preconditions - API support
    if (!isSupported) {
      const err = new Error("CSS Custom Highlight API is not supported");
      setError(err);
      handleError(err);
      return;
    }

    // 2. Validate preconditions - DOM element availability
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

    // 3. Normalize and validate search terms
    const searchTerms = normalizeSearchTerms(debouncedSearch);

    if (searchTerms.length === 0) {
      removeHighlight(highlightName, instanceIdRef.current);
      setMatchCount(0);
      handleHighlightChange(0);
      return;
    }

    // 4. Schedule highlight operation
    try {
      // Cancel any pending highlight operation to prevent race conditions
      if (idleCallbackRef.current !== null) {
        cancelIdleCallback(idleCallbackRef.current);
      }

      // Use requestIdleCallback for non-blocking execution
      idleCallbackRef.current = requestIdleCallback(
        () => {
          idleCallbackRef.current = null;
          try {
            // Find all text matches in the DOM
            const matches = findTextMatches(
              targetRef.current!,
              searchTerms,
              caseSensitive,
              wholeWord,
              maxHighlights,
              ignoredTags
            );

            // Register ranges with CSS Custom Highlight API
            const ranges = matches.map((match) => match.range);
            instanceIdRef.current = registerHighlight(highlightName, ranges, instanceIdRef.current);

            // Update state and notify listeners
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
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      handleError(error);
    }
  }, [
    debouncedSearch,
    highlightName,
    caseSensitive,
    wholeWord,
    maxHighlights,
    ignoredTags,
    isSupported,
  ]);

  useEffect(() => {
    performHighlight();

    return () => {
      // Cancel pending idle callback on cleanup
      if (idleCallbackRef.current !== null) {
        cancelIdleCallback(idleCallbackRef.current);
      }
      removeHighlight(highlightName, instanceIdRef.current);
    };
    // Effect events (handleHighlightChange, handleError) are NOT included in deps
    // They're stable references that always access latest callback values without triggering re-runs
  }, [performHighlight, highlightName]);

  return {
    matchCount,
    isSupported,
    error,
    refresh: performHighlight,
  };
}
