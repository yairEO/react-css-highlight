/** Error codes for programmatic handling */
export type HighlightErrorCode =
  | "UNSUPPORTED"
  | "INVALID_INPUT"
  | "REGISTER_FAILED"
  | "DOM_ERROR";

export class HighlightError extends Error {
  readonly code: HighlightErrorCode;

  constructor(code: HighlightErrorCode, message: string) {
    super(message);
    this.name = "HighlightError";
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Positional-comparison failures (still use same code taxonomy) */
export class CompareError extends HighlightError {
  constructor(code: HighlightErrorCode, message: string) {
    super(code, message);
    this.name = "CompareError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function normalizeError(e: unknown): Error {
  return e instanceof Error ? e : new Error(String(e));
}

export function assertHTMLElement(
  el: unknown,
  parameterName: string
): asserts el is HTMLElement {
  if (!el || typeof (el as HTMLElement).nodeType !== "number") {
    throw new HighlightError(
      "INVALID_INPUT",
      `${parameterName}: valid HTMLElement required`
    );
  }
}
