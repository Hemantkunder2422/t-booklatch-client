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
  token: string | null;
  isAuthenticated: boolean;

  setAuth: (user: AuthUser, token: string) => void;
  setToken: (token: string | null) => void;
  setUser: (user: AuthUser | null) => void;
  clear: () => void;
}

/**
 * Auth/session store. The token is read by the axios request interceptor
 * (see lib/axios.ts) and cleared automatically on a 401 response.
 * Persisted to localStorage so the session survives reloads.
 */
const useAuthStoreBase = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        token: null,
        isAuthenticated: false,

        setAuth: (user, token) =>
          set({ user, token, isAuthenticated: true }, false, "auth/setAuth"),
        setToken: (token) =>
          set({ token, isAuthenticated: !!token }, false, "auth/setToken"),
        setUser: (user) => set({ user }, false, "auth/setUser"),
        clear: () =>
          set(
            { user: null, token: null, isAuthenticated: false },
            false,
            "auth/clear",
          ),
      }),
      {
        name: "booklatch.auth",
        partialize: (state) => ({ token: state.token, user: state.user }),
      },
    ),
    { name: "AuthStore" },
  ),
);

export const useAuthStore = createSelectors(useAuthStoreBase);

/** Non-reactive accessors for use outside React (e.g. axios interceptors). */
export const authStore = {
  getToken: () => useAuthStoreBase.getState().token,
  clear: () => useAuthStoreBase.getState().clear(),
};
