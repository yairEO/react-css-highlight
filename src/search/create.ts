/**
 * Vanilla `createHighlight` — programmatic search highlighting.
 */

import { DEFAULT_MAX_HIGHLIGHTS } from "../shared/constants";
import { createControllerCore } from "../shared/controllerKit";
import { isHighlightAPISupported } from "../shared/cssHighlights";
import { isBrowser } from "../shared/dom";
import { HighlightError, normalizeError } from "../shared/errors";
import { createNoopController } from "../shared/noop";
import {
  fieldsChanged,
  HIGHLIGHT_RECOMPUTE_KEYS,
  mergeOptions,
} from "../shared/options";
import { createHighlightTarget } from "../shared/target";
import type { WithDefaults } from "../shared/types";
import { findTextMatches, normalizeSearchTerms } from "./findMatches";
import type { HighlightController, HighlightMatch, HighlightOptions } from "./types";

type ResolvedHighlightOptions = WithDefaults<{
  search: string | string[];
  highlightName: string;
  caseSensitive: boolean;
  wholeWord: boolean;
  maxHighlights: number;
  ignoredTags: string[];
  debounce: number;
  onHighlightChange: (count: number) => void;
  onError: (error: Error) => void;
  onPaint?: (info: { matchCount: number }) => void;
}>;

function toResolvedHighlightOptions(
  options: HighlightOptions
): ResolvedHighlightOptions {
  return {
    search: options.search,
    highlightName: options.highlightName ?? "highlight",
    caseSensitive: options.caseSensitive ?? false,
    wholeWord: options.wholeWord ?? false,
    maxHighlights: options.maxHighlights ?? DEFAULT_MAX_HIGHLIGHTS,
    ignoredTags: options.ignoredTags ?? [],
    debounce: options.debounce ?? 0,
    onHighlightChange: options.onHighlightChange ?? (() => {}),
    onError: options.onError ?? (() => {}),
    onPaint: options.onPaint,
  };
}

const UNSET = Symbol("unset");
type OverrideToken = typeof UNSET | string | string[];

/**
 * Creates highlight controller on DOM element with search highlighting.
 */
export function createHighlight(
  element: HTMLElement,
  options: HighlightOptions
): HighlightController {
  if (!options) {
    throw new HighlightError(
      "INVALID_INPUT",
      "createHighlight: options parameter is required"
    );
  }

  if (!element) {
    throw new HighlightError(
      "INVALID_INPUT",
      "createHighlight: HTMLElement parameter is required"
    );
  }

  const noopHighlight = (): HighlightController =>
    createNoopController({
      get matchCount() {
        return 0;
      },
      update() {},
      refresh() {},
    });

  if (!isBrowser() || !isHighlightAPISupported()) {
    const error = new HighlightError(
      "UNSUPPORTED",
      "CSS Custom Highlight API is not supported in this browser"
    );
    options.onError?.(error);
    return noopHighlight();
  }

  const core = createControllerCore();

  let current: ResolvedHighlightOptions = toResolvedHighlightOptions(options);

  const target = createHighlightTarget(current.highlightName, "search-highlight");

  let matchCount = 0;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let microQueued = false;
  let nextRefreshOverride: OverrideToken = UNSET;

  function flushHighlight(searchArg?: string | string[]): void {
    if (core.destroyed) return;
    core.scheduler.cancel();

    try {
      const searchToUse = searchArg !== undefined ? searchArg : current.search;
      const searchTerms = normalizeSearchTerms(searchToUse);

      if (searchTerms.length === 0) {
        matchCount = 0;
        target.clear();
        current.onHighlightChange(0);
        return;
      }

      const matches = findTextMatches(
        element,
        searchTerms,
        current.caseSensitive,
        current.wholeWord,
        current.maxHighlights,
        current.ignoredTags
      );

      matchCount = matches.length;
      current.onHighlightChange(matchCount);

      core.scheduler.schedule(() => {
        if (core.destroyed) return;
        try {
          const ranges = matches.map((m: HighlightMatch) => m.range);
          target.setRanges(ranges);
          current.onPaint?.({ matchCount });
        } catch (err) {
          current.onError(normalizeError(err));
        }
      });
    } catch (e) {
      target.clear();
      matchCount = 0;
      current.onError(normalizeError(e));
    }
  }

  function runQueuedFlush(): void {
    const token = nextRefreshOverride;
    nextRefreshOverride = UNSET;
    const ov = token === UNSET ? undefined : (token as string | string[]);
    flushHighlight(ov);
  }

  function enqueueCompute(refreshOverride?: OverrideToken): void {
    if (core.destroyed) return;

    if (refreshOverride !== UNSET && refreshOverride !== undefined) {
      nextRefreshOverride = refreshOverride as string | string[];
    }

    const debounceMs = current.debounce;
    if (debounceMs > 0) {
      if (debounceTimer !== null) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        debounceTimer = null;
        runQueuedFlush();
      }, debounceMs);
      return;
    }

    if (!microQueued) {
      microQueued = true;
      queueMicrotask(() => {
        microQueued = false;
        runQueuedFlush();
      });
    }
  }

  enqueueCompute(UNSET);

  return Object.freeze({
    get destroyed() {
      return core.destroyed;
    },
    get matchCount() {
      return matchCount;
    },

    update(newOptions: Partial<HighlightOptions>): void {
      if (core.destroyed) return;
      const prev = current;

      const highlightRenamed =
        typeof newOptions.highlightName === "string" &&
        newOptions.highlightName !== prev.highlightName;
      current = mergeOptions(current, newOptions);

      if (highlightRenamed) {
        target.rename(current.highlightName);
      }

      if (fieldsChanged(prev, current, HIGHLIGHT_RECOMPUTE_KEYS)) {
        enqueueCompute(UNSET);
      }
    },

    refresh(search?: string | string[]): void {
      if (core.destroyed) return;
      const token: OverrideToken =
        arguments.length === 0 ? UNSET : (search as string | string[]);
      enqueueCompute(token);
    },

    destroy(): void {
      core.teardown(() => {
        if (debounceTimer !== null) {
          clearTimeout(debounceTimer);
          debounceTimer = null;
        }
        microQueued = false;
        target.clear();
        matchCount = 0;
      });
    },
  } satisfies HighlightController) as HighlightController;
}
