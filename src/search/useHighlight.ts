import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react";
import { DEFAULT_DEBOUNCE_MS, DEFAULT_MAX_HIGHLIGHTS } from "../shared/constants";
import { isHighlightAPISupported } from "../shared/cssHighlights";
import { createHighlight, type HighlightController } from "./create";
import type { HighlightProps, UseHighlightResult } from "./reactTypes";
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
  onPaint,
}: HighlightProps): UseHighlightResult {
  const [matchCount, setMatchCount] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const isSupported = isHighlightAPISupported();
  const controllerRef = useRef<HighlightController | null>(null);

  const debouncedSearch = useDebounce(search, debounce);

  const handleHighlightChange = useEffectEvent((count: number) => {
    setMatchCount(count);
    onHighlightChange?.(count);
  });

  const handleError = useEffectEvent((err: Error) => {
    setError(err);
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

    controllerRef.current = createHighlight(targetRef.current, {
      search: debouncedSearch,
      highlightName,
      caseSensitive,
      wholeWord,
      maxHighlights,
      ignoredTags,
      debounce: 0,
      onHighlightChange: handleHighlightChange,
      onError: handleError,
      onPaint,
    });

    return () => {
      controllerRef.current?.destroy();
      controllerRef.current = null;
    };
  }, [targetRef, isSupported]);

  useEffect(() => {
    if (!controllerRef.current) return;

    controllerRef.current.update({
      search: debouncedSearch,
      highlightName,
      caseSensitive,
      wholeWord,
      maxHighlights,
      ignoredTags,
      onHighlightChange: handleHighlightChange,
      onError: handleError,
      onPaint,
    });
  }, [
    debouncedSearch,
    highlightName,
    caseSensitive,
    wholeWord,
    maxHighlights,
    ignoredTags,
  ]);

  const refresh = useCallback((searchArg?: string | string[]) => {
    controllerRef.current?.refresh(searchArg);
  }, []);

  return {
    matchCount,
    isSupported,
    error,
    refresh,
  };
}
