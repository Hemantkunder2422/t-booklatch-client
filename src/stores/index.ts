/**
 * Zustand stores barrel.
 *
 * Convention: one store per domain in `<name>.store.ts`, wrapped with
 * `createSelectors` so you can do `useAuthStore.use.user()`.
 * Keep SERVER data in TanStack Query; keep CLIENT state here.
 */
export { useAuthStore, authStore, type AuthUser } from "./auth.store";
export { useUIStore } from "./ui.store";
export {
  useSettingsStore,
  settingsStore,
  type PaymentSettings,
} from "./settings.store";
export { createSelectors } from "./create-selectors";
