import { cloneElement, isValidElement, type ReactElement, useRef } from "react";
import Highlight from "./Highlight";
import type { HighlightWrapperProps } from "./Highlight.types";

/**
 * HighlightWrapper - Convenience component for simple highlighting use cases
 *
 * This component manages the ref internally and injects it into the child element,
 * avoiding the need for an extra wrapper div.
 *
 * @example
 * ```tsx
 * <HighlightWrapper search="error">
 *   <div>This is an error message with error text.</div>
 * </HighlightWrapper>
 * ```
 *
 * @remarks
 * - The child element must be a single React element that accepts a `ref` prop
 * - For advanced use cases (multiple highlights, portals, etc.),
 *   use the base Highlight component with manual ref management
 *
 * @see {@link Highlight} for the base component with ref-based API
 */
export default function HighlightWrapper({
  children,
  ...highlightProps
}: HighlightWrapperProps): ReactElement {
  const contentRef = useRef<HTMLElement>(null);

  if (!isValidElement(children)) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "HighlightWrapper: children must be a single valid React element that accepts a ref"
      );
    }
    // Render children without highlighting as fallback
    return <>{children}</>;
  }

  // Clone the child element and inject our ref
  const childWithRef = cloneElement(children, {
    // @ts-expect-error - ref prop exists on all valid elements
    ref: contentRef,
  });

  return (
    <>
      <Highlight {...highlightProps} targetRef={contentRef} />
      {childWithRef}
    </>
  );
}
