import { IDLE_TIMEOUT_MS } from "./constants";

const hasRIC = typeof requestIdleCallback === "function";

export function scheduleIdle(
  cb: () => void,
  timeoutMs: number = IDLE_TIMEOUT_MS
): number {
  if (hasRIC) {
    return requestIdleCallback(cb, { timeout: timeoutMs });
  }
  return setTimeout(cb, 0) as unknown as number;
}

export function cancelIdle(id: number | null): void {
  if (id === null) return;
  if (hasRIC) cancelIdleCallback(id);
  else clearTimeout(id as unknown as ReturnType<typeof setTimeout>);
}

export interface IdleScheduler {
  readonly isPending: boolean;
  schedule(cb: () => void, timeoutMs?: number): void;
  cancel(): void;
}

/** Tracks one pending idle (or fallback) registration per consumer */
export function createIdleScheduler(): IdleScheduler {
  let idleCallbackId: number | null = null;

  return {
    get isPending() {
      return idleCallbackId !== null;
    },

    cancel() {
      if (idleCallbackId !== null) {
        cancelIdle(idleCallbackId);
        idleCallbackId = null;
      }
    },

    schedule(cb: () => void, timeoutMs: number = IDLE_TIMEOUT_MS): void {
      if (idleCallbackId !== null) cancelIdle(idleCallbackId);
      idleCallbackId = scheduleIdle(() => {
        idleCallbackId = null;
        cb();
      }, timeoutMs);
    },
  };
}
