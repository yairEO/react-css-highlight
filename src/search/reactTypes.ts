import type { ReactNode, RefObject } from "react";
import type { HighlightOptions } from "./types";

export interface HighlightProps extends HighlightOptions {
  targetRef: RefObject<HTMLElement | null>;
}

export interface HighlightWrapperProps extends Omit<HighlightProps, "targetRef"> {
  children: ReactNode;
}

export interface UseHighlightResult {
  matchCount: number;
  isSupported: boolean;
  error: Error | null;
  refresh: (search?: string | string[]) => void;
}
