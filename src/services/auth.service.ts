import { http } from "@/lib/http";
import type { AuthUser } from "@/stores/auth.store";

/**
 * Auth data layer — pure functions that call the API via the typed `http`
 * helper. Errors are already normalized to `ApiError` by the axios interceptor.
 */

export interface SigninPayload {
  email: string;
  password: string;
}

/**
 * The backend's raw sign-in payload. Authentication is carried by an http-only
 * cookie the server sets on this response, so we only read the user profile.
 * Kept loose because the user can arrive under a few different keys or wrapped
 * in a `{ data }` envelope; `normalizeUser` reduces it to an `AuthUser`.
 */
interface RawUser {
  id?: string | number;
  _id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  avatar?: string;
  avatarUrl?: string;
}

interface RawSigninBody {
  user?: RawUser;
  data?: RawUser & { user?: RawUser };
}

function fullName(user: RawUser): string {
  if (user.name?.trim()) return user.name.trim();
  const parts = [user.firstName, user.lastName].filter(Boolean);
  if (parts.length) return parts.join(" ");
  return user.email ?? "";
}

function normalizeUser(body: RawSigninBody): AuthUser {
  const raw = body.user ?? body.data?.user ?? body.data ?? {};
  return {
    id: String(raw.id ?? raw._id ?? ""),
    name: fullName(raw),
    email: raw.email ?? "",
    role: raw.role,
    avatarUrl: raw.avatarUrl ?? raw.avatar,
  };
}

export const authService = {
  signin: async (payload: SigninPayload): Promise<AuthUser> => {
    const body = await http.post<RawSigninBody>("/auth/signin", payload);
    return normalizeUser(body);
  },

  /** Verify the current session cookie and return the signed-in user. */
  me: async (): Promise<AuthUser> => {
    const body = await http.get<RawSigninBody>("/auth/me");
    return normalizeUser(body);
  },

  /** Clear the session cookie on the server. */
  signout: () => http.post<void>("/auth/signout"),
};
