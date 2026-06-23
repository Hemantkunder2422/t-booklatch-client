import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

/**
 * Centralized Axios instance for the BookLatch API.
 * Base URL is configurable via NEXT_PUBLIC_API_BASE_URL.
 */
export const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api",
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  // Set to true if your API relies on http-only auth cookies.
  withCredentials: false,
});

const TOKEN_STORAGE_KEY = "booklatch.access_token";

/** Read the persisted auth token (client-side only). */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

/** Persist or clear the auth token. */
export function setAuthToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

// ── Request interceptor ─────────────────────────────────────────────
// Attach the bearer token to every outgoing request when available.
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor ────────────────────────────────────────────
// Normalize errors and handle auth failures in one place.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    if (error.response) {
      const { status } = error.response;

      // Unauthorized — clear the stale token and bounce to login.
      if (status === 401 && typeof window !== "undefined") {
        setAuthToken(null);
        const here = window.location.pathname + window.location.search;
        if (!window.location.pathname.startsWith("/login")) {
          window.location.assign(`/login?next=${encodeURIComponent(here)}`);
        }
      }
    }

    return Promise.reject(normalizeError(error));
  },
);

/** Shape most APIs use for error payloads. */
export interface ApiErrorBody {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface NormalizedApiError {
  status: number | null;
  message: string;
  fieldErrors?: Record<string, string[]>;
  raw: unknown;
}

/** Turn any Axios failure into a predictable, displayable error object. */
export function normalizeError(
  error: AxiosError<ApiErrorBody>,
): NormalizedApiError {
  const status = error.response?.status ?? null;
  const data = error.response?.data;

  const message =
    data?.message ||
    data?.error ||
    error.message ||
    "Something went wrong. Please try again.";

  return {
    status,
    message,
    fieldErrors: data?.errors,
    raw: error.response?.data ?? error,
  };
}

export default api;
