import type { BaseController } from "./types";

/** Frozen noop controller skeleton; callers merge feature-specific getters */
export function createNoopController<T extends BaseController>(
  defaults: Omit<T, keyof BaseController>
): Readonly<T> {
  const base: BaseController = {
    get destroyed() {
      return true;
    },
    refresh() {},
    destroy() {},
  };
  return Object.freeze(Object.assign(base, defaults) as T);
}
