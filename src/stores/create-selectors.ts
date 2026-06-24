import type { StoreApi, UseBoundStore } from "zustand";

/**
 * Auto-generate typed `.use.<field>()` selectors for a Zustand store so you can
 * subscribe to a single slice without writing a selector each time:
 *
 *   const token = useAuthStore.use.token();   // re-renders only when token changes
 *
 * instead of `useAuthStore((s) => s.token)`.
 */
type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never;

export function createSelectors<S extends UseBoundStore<StoreApi<object>>>(
  store: S,
) {
  const withUse = store as WithSelectors<S>;
  withUse.use = {} as WithSelectors<S>["use"];
  for (const key of Object.keys(store.getState())) {
    (withUse.use as Record<string, unknown>)[key] = () =>
      store((state) => state[key as keyof typeof state]);
  }
  return withUse;
}
