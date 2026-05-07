/**
 * CSS Custom Highlight API registration (global instance map).
 *
 * Holds Range references until {@link removeHighlight} or teardown.
 */

/**
 * Check if CSS Custom Highlight API is supported
 */
export function isHighlightAPISupported(): boolean {
  return typeof CSS !== "undefined" && "highlights" in CSS;
}

const instanceRanges = new Map<string, Map<symbol, Range[]>>();

/**
 * Register highlights with CSS.highlights API
 * Supports multiple instances sharing the same highlightName
 */
export function registerHighlight(
  highlightName: string,
  ranges: Range[],
  instanceId?: symbol
): symbol {
  if (!isHighlightAPISupported()) {
    return instanceId || Symbol();
  }

  const id = instanceId || Symbol();

  if (!instanceRanges.has(highlightName)) {
    instanceRanges.set(highlightName, new Map());
  }
  instanceRanges.get(highlightName)!.set(id, ranges);

  const allRanges = Array.from(instanceRanges.get(highlightName)!.values()).flat();
  const highlight = new Highlight(...allRanges);
  CSS.highlights.set(highlightName, highlight);

  return id;
}

/**
 * Remove highlight from CSS.highlights API
 * If instanceId provided, only removes that instance's ranges
 */
export function removeHighlight(highlightName: string, instanceId?: symbol): void {
  if (!isHighlightAPISupported()) {
    return;
  }

  if (!instanceId) {
    instanceRanges.delete(highlightName);
    CSS.highlights.delete(highlightName);
    return;
  }

  const instances = instanceRanges.get(highlightName);
  if (!instances) return;

  instances.delete(instanceId);

  if (instances.size === 0) {
    instanceRanges.delete(highlightName);
    CSS.highlights.delete(highlightName);
  } else {
    const allRanges = Array.from(instances.values()).flat();
    const highlight = new Highlight(...allRanges);
    CSS.highlights.set(highlightName, highlight);
  }
}
