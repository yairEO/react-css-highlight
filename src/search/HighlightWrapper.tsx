import { cloneElement, isValidElement, type ReactElement, useRef } from "react";
import Highlight from "./Highlight";
import type { HighlightWrapperProps } from "./reactTypes";

/**
 * Wrapper that injects a ref into a single child for highlighting.
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
    return <>{children}</>;
  }

  const childWithRef = cloneElement(children, {
    // @ts-expect-error ref on DOM elements
    ref: contentRef,
  });

  return (
    <>
      <Highlight {...highlightProps} targetRef={contentRef} />
      {childWithRef}
    </>
  );
}
