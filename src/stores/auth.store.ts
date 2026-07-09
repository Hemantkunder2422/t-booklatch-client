import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { createSelectors } from "./create-selectors";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role?: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;

  setAuth: (user: AuthUser) => void;
  setUser: (user: AuthUser | null) => void;
  clear: () => void;
}

/**
 * Auth/session store. Authentication itself lives in an http-only cookie set by
 * the backend (sent automatically because axios uses `withCredentials`), so no
 * token is ever stored client-side. We only persist the current user for the UI
 * and clear it on a 401 response (see lib/axios.ts).
 */
const useAuthStoreBase = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,

        setAuth: (user) =>
          set({ user, isAuthenticated: true }, false, "auth/setAuth"),
        setUser: (user) =>
          set({ user, isAuthenticated: !!user }, false, "auth/setUser"),
        clear: () =>
          set({ user: null, isAuthenticated: false }, false, "auth/clear"),
      }),
      {
        name: "booklatch.auth",
        partialize: (state) => ({ user: state.user }),
      },
    ),
    { name: "AuthStore" },
  ),
);

export const useAuthStore = createSelectors(useAuthStoreBase);

/** Non-reactive accessors for use outside React (e.g. axios interceptors). */
export const authStore = {
  clear: () => useAuthStoreBase.getState().clear(),
};
