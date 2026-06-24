import type { AxiosRequestConfig } from "axios";
import { api } from "./axios";

/**
 * Thin, typed wrappers around the axios instance that return `response.data`
 * directly — so service functions read cleanly:
 *
 *   export const getVenues = () => http.get<Venue[]>("/venues");
 *   export const createVenue = (body: VenueInput) => http.post<Venue>("/venues", body);
 *
 * Errors are already normalized to `ApiError` by the response interceptor.
 */
async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await api.request<T>(config);
  return response.data;
}

export const http = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: "GET", url }),

  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: "POST", url, data }),

  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: "PUT", url, data }),

  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: "PATCH", url, data }),

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: "DELETE", url }),
};

export type Http = typeof http;
