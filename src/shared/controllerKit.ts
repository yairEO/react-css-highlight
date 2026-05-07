import { createIdleScheduler, type IdleScheduler } from "./scheduler";

export interface ControllerCore {
  readonly destroyed: boolean;
  readonly scheduler: IdleScheduler;
  assertAlive(): void;
  /** Idempotent: first call runs cleanup and sets destroyed */
  teardown(cleanup: () => void): void;
}

export function createControllerCore(): ControllerCore {
  const scheduler = createIdleScheduler();
  let destroyed = false;

  return {
    get destroyed() {
      return destroyed;
    },

    scheduler,

    assertAlive() {
      if (destroyed) {
        throw new Error("Controller already destroyed");
      }
    },

    teardown(cleanup) {
      if (destroyed) return;
      destroyed = true;
      scheduler.cancel();
      cleanup();
    },
  };
}
