"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";

/**
 * Client-side route protection.
 *
 * Auth is an http-only cookie set by the API on a separate origin, so the
 * cookie can't be read here (or in edge middleware) — the persisted session in
 * the auth store is the client's source of truth, and the axios 401 interceptor
 * force-logs-out on expiry. These guards gate the two route groups:
 *   - AuthGuard  wraps (protected) — requires a session.
 *   - GuestGuard wraps (public)    — keeps signed-in users out of /login.
 */

/** True after the first client frame — lets the persisted store rehydrate and
 *  avoids a server/client markup mismatch (both render the loading state). */
function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return mounted;
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore.use.isAuthenticated();
  const setUser = useAuthStore.use.setUser();
  const mounted = useMounted();

  // Bounce unauthenticated users to the login screen, preserving where they
  // were headed so they land back there after signing in.
  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [mounted, isAuthenticated, pathname, router]);

  // Revalidate the session cookie against the API on entry. A 401 is handled by
  // the axios interceptor (clears the store → this guard then redirects); other
  // failures are ignored so a transient error doesn't sign the user out.
  useEffect(() => {
    if (!mounted || !isAuthenticated) return;
    let active = true;
    authService
      .me()
      .then((user) => {
        if (active) setUser(user);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [mounted, isAuthenticated, setUser]);

  if (!mounted || !isAuthenticated) {
    return <RouteLoader />;
  }
  return <>{children}</>;
}

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore.use.isAuthenticated();
  const mounted = useMounted();

  useEffect(() => {
    if (mounted && isAuthenticated) {
      const next = new URLSearchParams(window.location.search).get("next");
      router.replace(next?.startsWith("/") ? next : "/");
    }
  }, [mounted, isAuthenticated, router]);

  if (mounted && isAuthenticated) {
    return <RouteLoader />;
  }
  return <>{children}</>;
}

function RouteLoader() {
  return (
    <div className="grid min-h-svh place-items-center">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}
