"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { DEV_LOGIN_ENABLED } from "./dev-login";

/**
 * Dev-only: the auth store persists `user` but not `isAuthenticated`, so a
 * dev-bypass session would otherwise be forgotten on every reload. When the
 * bypass is enabled, re-derive the authenticated flag from the persisted user
 * after hydration so the session survives refreshes.
 *
 * A harmless no-op when the bypass is disabled — and dead code in production,
 * where `DEV_LOGIN_ENABLED` folds to `false`.
 */
export function DevAuthBootstrap() {
  const user = useAuthStore.use.user();
  const isAuthenticated = useAuthStore.use.isAuthenticated();
  const setUser = useAuthStore.use.setUser();

  useEffect(() => {
    if (!DEV_LOGIN_ENABLED) return;
    if (user && !isAuthenticated) setUser(user);
  }, [user, isAuthenticated, setUser]);

  return null;
}
