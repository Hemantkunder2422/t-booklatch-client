import type { AuthUser } from "@/stores/auth.store";

/**
 * Dev-only login bypass.
 *
 * Double-gated so it can NEVER work in a production build:
 *   1. `process.env.NODE_ENV` must not be "production" — true only under
 *      `next dev`. Next inlines this at build time, so every guarded branch
 *      below becomes dead code (and is tree-shaken) in `next build`/`next start`.
 *   2. `NEXT_PUBLIC_DEV_LOGIN` must be explicitly set to "true".
 *
 * To enable locally, add to `.env.local`:
 *   NEXT_PUBLIC_DEV_LOGIN=true
 */
export const DEV_LOGIN_ENABLED =
  process.env.NODE_ENV !== "production" &&
  process.env.NEXT_PUBLIC_DEV_LOGIN === "true";

/** The local account a dev-bypass session is signed in as. */
export const DEV_USER: AuthUser = {
  id: "dev-user",
  name: "Dev User",
  email: "dev@booklatch.local",
  role: "owner",
};
