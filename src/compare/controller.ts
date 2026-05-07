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
import { buildTextMap, isBrowser, type TextMap } from "../shared/dom";
import {
  assertHTMLElement,
  CompareError,
  HighlightError,
  normalizeError,
} from "../shared/errors";
import { createNoopController } from "../shared/noop";
import {
  COMPARE_NAME_KEYS,
  COMPARE_RECOMPUTE_KEYS,
  fieldsChanged,
  mergeOptions,
} from "../shared/options";
import { createHighlightTarget } from "../shared/target";
import type { WithDefaults } from "../shared/types";
import { positionalDiffFn } from "./diff";
import { mapDiffToRanges } from "./rangeMapper";
import type {
  CompareController,
  CompareInput,
  CompareOptions,
  CompareSource,
} from "./types";

function toSource(input: CompareInput): CompareSource {
  if (typeof input === "string") {
    return { kind: "text", text: input };
  }
  assertHTMLElement(input, "createCompareHighlight: base/compare");
  return { kind: "element", element: input };
}

function buildSourceMap(src: CompareSource, ignoredTags: string[]): TextMap {
  return src.kind === "text"
    ? { text: src.text, segments: [] }
    : buildTextMap(src.element, ignoredTags);
}

function toResolvedCompare(o: CompareOptions): WithDefaults<CompareOptions> {
  return {
    ignoredTags: o.ignoredTags ?? [],
    debounce: o.debounce ?? DEFAULT_COMPARE_DEBOUNCE_MS,
    onError: o.onError ?? (() => {}),
    baseHighlightName: o.baseHighlightName ?? DEFAULT_COMPARE_BASE_HIGHLIGHT,
    compareHighlightName:
      o.compareHighlightName ?? DEFAULT_COMPARE_COMPARE_HIGHLIGHT,
    onDiffChange: o.onDiffChange ?? (() => {}),
    onPaint: o.onPaint,
    diff: o.diff ?? positionalDiffFn,
  } as WithDefaults<CompareOptions>;
}

/**
 * Highlights positional UTF-16 differences between two subtree texts or
 * compares a flattened string against one subtree (`HTMLElement | string`).
 *
 * Holds live `Range` objects until cleared — call {@link CompareController.destroy} when tearing down subtrees,
 * otherwise ranges may linger in CSS.highlights' internal bucket.
 *
 * String sides participate in the diff but cannot be painted (no DOM `Range`).
 * When both inputs are strings, computing runs but no highlights are scheduled.
 *
 * @param base Reference DOM root or flattened reference text
 * @param compare Modified DOM root or flattened reference text
 * @since 3.0.0
 */
export function createCompareHighlight(
  base: CompareInput,
  compare: CompareInput,
  options: CompareOptions = {}
): CompareController {
  if (base == null || compare == null) {
    throw new HighlightError(
      "INVALID_INPUT",
      "createCompareHighlight: base and compare are required"
    );
  }

  const baseSource = toSource(base);
  const compareSource = toSource(compare);

  const sourcesView = Object.freeze({
    base: baseSource,
    compare: compareSource,
  });

  const noopCompare = (): CompareController =>
    createNoopController({
      get diffCount() {
        return 0;
      },
      get sources() {
        return sourcesView;
      },
      update() {},
    });

  if (!isBrowser() || !isHighlightAPISupported()) {
    const err = new CompareError(
      "UNSUPPORTED",
      "CSS Custom Highlight API is not supported in this browser"
    );
    options.onError?.(err);
    return noopCompare();
  }

  const core = createControllerCore();

  let current: WithDefaults<CompareOptions> = toResolvedCompare(options);

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
      const baseMap = buildSourceMap(baseSource, current.ignoredTags);
      const compareMap = buildSourceMap(compareSource, current.ignoredTags);

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

      const {
        baseRanges: baseDiffRanges,
        compareRanges: compareDiffRanges,
        diffCount: count,
      } = current.diff(baseMap.text, compareMap.text);
      diffCount = count;
      current.onDiffChange(diffCount);

      if (diffCount === 0) {
        baseTarget.clear();
        compareTarget.clear();
        return;
      }

      const bothText = baseSource.kind === "text" && compareSource.kind === "text";
      if (bothText) {
        return;
      }

      const baseRanges = mapDiffToRanges(baseDiffRanges, baseMap);
      const compareRanges = mapDiffToRanges(compareDiffRanges, compareMap);

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
    get sources() {
      return sourcesView;
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
