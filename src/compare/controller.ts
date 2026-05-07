/**
 * DOM positional comparison via CSS Custom Highlight API.
 */

import {
  DEFAULT_COMPARE_BASE_HIGHLIGHT,
  DEFAULT_COMPARE_COMPARE_HIGHLIGHT,
  DEFAULT_COMPARE_DEBOUNCE_MS,
} from "../shared/constants";
import { createControllerCore } from "../shared/controllerKit";
import { isHighlightAPISupported } from "../shared/cssHighlights";
import { buildTextMap, isBrowser } from "../shared/dom";
import { CompareError, HighlightError, normalizeError } from "../shared/errors";
import { createNoopController } from "../shared/noop";
import {
  COMPARE_NAME_KEYS,
  COMPARE_RECOMPUTE_KEYS,
  fieldsChanged,
  mergeOptions,
} from "../shared/options";
import { createHighlightTarget } from "../shared/target";
import type { WithDefaults } from "../shared/types";
import { positionalDiff } from "./diff";
import { mapDiffToRanges } from "./rangeMapper";
import type { CompareController, CompareOptions } from "./types";

type ResolvedCompareOptions = WithDefaults<{
  baseHighlightName: string;
  compareHighlightName: string;
  ignoredTags: string[];
  debounce: number;
  onDiffChange: (diffCount: number) => void;
  onError: (error: Error) => void;
  onPaint?: (info: { diffCount: number }) => void;
}>;

function toResolvedCompare(o: CompareOptions): ResolvedCompareOptions {
  return {
    baseHighlightName: o.baseHighlightName ?? DEFAULT_COMPARE_BASE_HIGHLIGHT,
    compareHighlightName:
      o.compareHighlightName ?? DEFAULT_COMPARE_COMPARE_HIGHLIGHT,
    ignoredTags: o.ignoredTags ?? [],
    debounce: o.debounce ?? DEFAULT_COMPARE_DEBOUNCE_MS,
    onDiffChange: o.onDiffChange ?? (() => {}),
    onError: o.onError ?? (() => {}),
    onPaint: o.onPaint,
  };
}

/**
 * Highlights positional UTF-16 differences between two subtree texts.
 *
 * Holds live `Range` objects until cleared — call {@link CompareController.destroy} when tearing down subtrees,
 * otherwise ranges may linger in CSS.highlights' internal bucket.
 *
 * @param baseElement Reference DOM root
 * @param compareElement Modified DOM root
 * @since 3.0.0
 */
export function createCompareHighlight(
  baseElement: HTMLElement,
  compareElement: HTMLElement,
  options: CompareOptions = {}
): CompareController {
  const noopCompare = (): CompareController =>
    createNoopController({
      get diffCount() {
        return 0;
      },
      get elements() {
        return {
          base: baseElement as HTMLElement,
          compare: compareElement as HTMLElement,
        };
      },
      update() {},
      refresh() {},
    });

  if (!baseElement || !compareElement) {
    throw new HighlightError(
      "INVALID_INPUT",
      "createCompareHighlight: baseElement and compareElement are required"
    );
  }

  if (!isBrowser() || !isHighlightAPISupported()) {
    const err = new CompareError(
      "UNSUPPORTED",
      "CSS Custom Highlight API is not supported in this browser"
    );
    options.onError?.(err);
    return noopCompare();
  }

  const core = createControllerCore();

  let current: ResolvedCompareOptions = toResolvedCompare(options);

  const baseTarget = createHighlightTarget(
    current.baseHighlightName,
    "compare-highlight-base"
  );
  const compareTarget = createHighlightTarget(
    current.compareHighlightName,
    "compare-highlight-compare"
  );

  let diffCount = 0;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let microQueued = false;

  function flushCompare(): void {
    if (core.destroyed) return;
    core.scheduler.cancel();

    try {
      const baseMap = buildTextMap(baseElement, current.ignoredTags);
      const compareMap = buildTextMap(compareElement, current.ignoredTags);

      const bothEmpty = baseMap.text.length === 0 && compareMap.text.length === 0;
      if (bothEmpty) {
        if (diffCount !== 0) {
          diffCount = 0;
          current.onDiffChange(0);
        }
        baseTarget.clear();
        compareTarget.clear();
        return;
      }

      if (baseMap.text === compareMap.text) {
        if (diffCount !== 0) {
          diffCount = 0;
          current.onDiffChange(0);
        }
        baseTarget.clear();
        compareTarget.clear();
        return;
      }

      const { ranges, diffCount: count } = positionalDiff(
        baseMap.text,
        compareMap.text
      );
      diffCount = count;
      current.onDiffChange(diffCount);

      if (diffCount === 0) {
        baseTarget.clear();
        compareTarget.clear();
        return;
      }

      const baseRanges = mapDiffToRanges(ranges, baseMap);
      const compareRanges = mapDiffToRanges(ranges, compareMap);

      core.scheduler.schedule(() => {
        if (core.destroyed) return;
        try {
          baseTarget.setRanges(baseRanges);
          compareTarget.setRanges(compareRanges);
          current.onPaint?.({ diffCount });
        } catch (e) {
          current.onError(normalizeError(e));
          baseTarget.clear();
          compareTarget.clear();
          diffCount = 0;
        }
      });
    } catch (e) {
      current.onError(normalizeError(e));
      baseTarget.clear();
      compareTarget.clear();
      diffCount = 0;
    }
  }

  function enqueueCompare(): void {
    if (core.destroyed) return;

    const debounceMs = current.debounce;
    if (debounceMs > 0) {
      if (debounceTimer !== null) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        debounceTimer = null;
        flushCompare();
      }, debounceMs);
      return;
    }

    if (!microQueued) {
      microQueued = true;
      queueMicrotask(() => {
        microQueued = false;
        flushCompare();
      });
    }
  }

  enqueueCompare();

  return Object.freeze({
    get destroyed() {
      return core.destroyed;
    },
    get diffCount() {
      return diffCount;
    },
    get elements() {
      return Object.freeze({
        base: baseElement,
        compare: compareElement,
      });
    },

    update(newOptions: Partial<CompareOptions>): void {
      if (core.destroyed) return;
      const prev = current;
      current = mergeOptions(current, newOptions);

      if (prev.baseHighlightName !== current.baseHighlightName) {
        baseTarget.rename(current.baseHighlightName);
      }
      if (prev.compareHighlightName !== current.compareHighlightName) {
        compareTarget.rename(current.compareHighlightName);
      }

      const recompute =
        fieldsChanged(prev, current, COMPARE_RECOMPUTE_KEYS) ||
        fieldsChanged(prev, current, COMPARE_NAME_KEYS);

      if (recompute) enqueueCompare();
    },

    refresh() {
      enqueueCompare();
    },

    destroy() {
      core.teardown(() => {
        if (debounceTimer !== null) {
          clearTimeout(debounceTimer);
          debounceTimer = null;
        }
        microQueued = false;
        baseTarget.clear();
        compareTarget.clear();
        diffCount = 0;
      });
    },
  } satisfies CompareController) as CompareController;
}
