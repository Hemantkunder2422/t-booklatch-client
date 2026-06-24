/**
 * Shared API contract types.
 * Adjust these to match your backend's response envelope.
 */

/** Standard success envelope: `{ data, message }`. */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

/** Cursor/offset pagination envelope. */
export interface Paginated<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/** Normalized error shape surfaced to the UI (see lib/axios.ts). */
export interface ApiError {
  status: number | null;
  message: string;
  /** Field-level validation errors, keyed by field name. */
  fieldErrors?: Record<string, string[]>;
  raw?: unknown;
}

/** Common query params for list endpoints. */
export interface ListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
}

/** A unique identifier type — swap to `number` if your API uses numeric ids. */
export type Id = string;
