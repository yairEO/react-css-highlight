import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react";
import { DEFAULT_DEBOUNCE_MS, DEFAULT_MAX_HIGHLIGHTS } from "./Highlight.constants";
import type { HighlightProps, UseHighlightResult } from "./Highlight.types";
import { isHighlightAPISupported } from "./Highlight.utils";
import { useDebounce } from "./useDebounce";
import { createHighlight, type HighlightController } from "./vanilla";

export function useHighlight({
  search, // if array, should be memoed
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
  const controllerRef = useRef<HighlightController | null>(null);

  // Debounce search input to prevent excessive re-highlighting
  const debouncedSearch = useDebounce(search, debounce);

  // Extract callback handlers into effect events to avoid including them in dependencies
  // These always access the latest values without triggering effect re-runs
  const handleHighlightChange = useEffectEvent((count: number) => {
    setMatchCount(count);
    onHighlightChange?.(count);
  });

  const handleError = useEffectEvent((err: Error) => {
    setError(err);
    onError?.(err);
  });

  // Create controller on mount and when targetRef or support status changes
  useEffect(() => {
    // Validate preconditions
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

    // Create vanilla controller with initial options
    controllerRef.current = createHighlight(targetRef.current, {
      search: debouncedSearch,
      highlightName,
      caseSensitive,
      wholeWord,
      maxHighlights,
      ignoredTags,
      onHighlightChange: handleHighlightChange,
      onError: handleError,
    });

    return () => {
      controllerRef.current?.destroy();
      controllerRef.current = null;
    };
    // Effect events (handleHighlightChange, handleError) are NOT included in deps
    // They're stable references that always access latest callback values without triggering re-runs
  }, [targetRef, isSupported]);

  // Sync option changes to controller
  useEffect(() => {
    if (!controllerRef.current) return;

    controllerRef.current.update({
      search: debouncedSearch,
      highlightName,
      caseSensitive,
      wholeWord,
      maxHighlights,
      ignoredTags,
    });
  }, [
    debouncedSearch,
    highlightName,
    caseSensitive,
    wholeWord,
    maxHighlights,
    ignoredTags,
  ]);

  const refresh = useCallback((search?: string | string[]) => {
    controllerRef.current?.refresh(search);
  }, []);

  return {
    matchCount,
    isSupported,
    error,
    refresh,
  };
}
