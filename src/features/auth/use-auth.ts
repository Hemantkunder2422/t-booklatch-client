"use client";

import { useMutation } from "@tanstack/react-query";
import { authService, type SigninPayload } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";

/**
 * Sign-in mutation. The backend sets an http-only session cookie on success;
 * we just store the returned user for the UI. Callers handle redirect / error
 * toasts in `onSuccess` / `onError`.
 */
export function useSignin() {
  const setAuth = useAuthStore.use.setAuth();

  return useMutation({
    mutationFn: (payload: SigninPayload) => authService.signin(payload),
    onSuccess: (user) => setAuth(user),
  });
}
