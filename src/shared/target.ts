import { registerHighlight, removeHighlight } from "./cssHighlights";

export interface HighlightTarget {
  readonly currentName: string;
  /** Replaces this instance's contribution under {@link currentName} */
  setRanges(ranges: Range[]): void;
  /** If name differs, clears old bucket and resets instance symbol */
  rename(newName: string): boolean;
  /** Removes this instance from CSS.highlights for current name */
  clear(): void;
}

export function createHighlightTarget(
  initialName: string,
  symbolDescription: string
): HighlightTarget {
  let highlightName = initialName;
  let instanceId = Symbol(symbolDescription);

  return {
    get currentName() {
      return highlightName;
    },

    setRanges(ranges: Range[]) {
      instanceId = registerHighlight(highlightName, ranges, instanceId);
    },

    rename(newName: string): boolean {
      if (newName === highlightName) return false;
      removeHighlight(highlightName, instanceId);
      highlightName = newName;
      instanceId = Symbol(symbolDescription);
      return true;
    },

    clear() {
      removeHighlight(highlightName, instanceId);
    },
  };
}
