import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { authStore } from "@/stores/auth.store";
import type { ApiError } from "@/types/api";

/**
 * Global Axios instance for the BookLatch API.
 *
 * - Base URL comes from NEXT_PUBLIC_API_BASE_URL (falls back to "/api").
 * - The bearer token is read from the Zustand auth store on every request.
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
  // Flip to true if your API uses http-only auth cookies instead of bearer tokens.
  withCredentials: false,
});

/** Shape most backends use for error payloads. */
interface ApiErrorBody {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

// ── Request interceptor ─────────────────────────────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authStore.getToken();
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

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
