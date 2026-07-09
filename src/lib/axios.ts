import axios, { AxiosError, type AxiosInstance } from "axios";
import { authStore } from "@/stores/auth.store";
import type { ApiError } from "@/types/api";

/**
 * Global Axios instance for the BookLatch API.
 *
 * - Base URL comes from NEXT_PUBLIC_API_BASE_URL (falls back to "/api").
 * - Auth uses an http-only session cookie set by the backend; `withCredentials`
 *   makes the browser send it on every request. No token is handled in JS.
 * - 401s clear the session and bounce to /login.
 * - All errors are normalized to `ApiError` (see types/api.ts).
 */
export const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api",
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  // Send the http-only auth cookie with every request.
  withCredentials: true,
});

/** Shape most backends use for error payloads. */
interface ApiErrorBody {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

// ── Response interceptor ────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      authStore.clear();
      const here = window.location.pathname + window.location.search;
      if (!window.location.pathname.startsWith("/login")) {
        window.location.assign(`/login?next=${encodeURIComponent(here)}`);
      }
    }
    return Promise.reject(normalizeError(error));
  },
);

/** Turn any Axios failure into a predictable, displayable `ApiError`. */
export function normalizeError(error: AxiosError<ApiErrorBody>): ApiError {
  const data = error.response?.data;
  return {
    status: error.response?.status ?? null,
    message:
      data?.message ||
      data?.error ||
      error.message ||
      "Something went wrong. Please try again.",
    fieldErrors: data?.errors,
    raw: error.response?.data ?? error,
  };
}

export default api;
