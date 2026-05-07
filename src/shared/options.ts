import type { WithDefaults } from "./types";

/**
 * Applies defaults — only keys declared on defaults must appear on `defaults`.
 */
export function applyDefaults<T extends object>(
  input: Partial<T>,
  defaults: WithDefaults<T>
): WithDefaults<T> {
  return { ...defaults, ...stripUndefined(input as T) };
}

/** Deep-merge-ish: only replaces keys present in patch with defined values */
export function mergeOptions<T extends object>(
  current: WithDefaults<T>,
  patch: Partial<T>
): WithDefaults<T> {
  const p = stripUndefined(patch as T);
  return { ...(current as object), ...p } as WithDefaults<T>;
}

function stripUndefined<T extends object>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const k of Object.keys(obj) as (keyof T)[]) {
    if (obj[k] !== undefined) {
      out[k] = obj[k];
    }
  }
  return out;
}

/** True if any watched key differs between prev and next */
export function fieldsChanged<K extends keyof T, T extends object>(
  prev: T,
  next: T,
  keys: readonly K[]
): boolean {
  for (const key of keys) {
    if (prev[key] !== next[key]) return true;
  }
  return false;
}

/** Search controller: recomputation fields (callbacks/debounce-only updates skip) */
export const HIGHLIGHT_RECOMPUTE_KEYS = [
  "search",
  "highlightName",
  "caseSensitive",
  "wholeWord",
  "maxHighlights",
  "ignoredTags",
  "debounce",
] as const;

/** Compare controller */
export const COMPARE_RECOMPUTE_KEYS = ["ignoredTags", "debounce", "diff"] as const;
export const COMPARE_NAME_KEYS = [
  "baseHighlightName",
  "compareHighlightName",
] as const;
