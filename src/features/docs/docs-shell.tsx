"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, PanelLeft, X } from "lucide-react";
import { BookLatchLogo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DocsNav } from "./docs-nav";
import { DocsSearch } from "./docs-search";

/**
 * Chrome for the public docs site: sticky header (logo · search · theme ·
 * open-app), a persistent sidebar on desktop, a slide-over drawer on mobile,
 * and a focusable main region reachable via the skip link.
 */
export function DocsShell({ children }: { children: React.ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="min-h-svh bg-background">
      <a
        href="#docs-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-60 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Skip to content
      </a>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
        <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
          <Button
            variant="ghost"
            size="icon-sm"
            className="lg:hidden"
            aria-label="Open navigation"
            aria-expanded={navOpen}
            onClick={() => setNavOpen(true)}
          >
            <PanelLeft className="size-4" />
          </Button>

          <Link
            href="/docs"
            className="flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <BookLatchLogo showText={false} iconClassName="size-8" />
            <span className="flex items-baseline gap-1.5">
              <span className="text-base font-semibold tracking-tight">
                BookLatch
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                Docs
              </span>
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <DocsSearch />
            <ThemeToggle />
            <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
              <Link href="/">
                Open app
                <ArrowUpRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-360">
        {/* Desktop sidebar */}
        <aside className="sticky top-14 hidden h-[calc(100svh-3.5rem)] w-64 shrink-0 overflow-y-auto border-r px-3 lg:block">
          <DocsNav />
        </aside>

        {/* Mobile drawer */}
        {navOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setNavOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute inset-y-0 left-0 flex w-72 max-w-[80%] flex-col overflow-y-auto border-r bg-background px-3 shadow-lg">
              <div className="flex h-14 items-center justify-between">
                <span className="px-2 text-sm font-semibold">Documentation</span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Close navigation"
                  onClick={() => setNavOpen(false)}
                >
                  <X className="size-4" />
                </Button>
              </div>
              <DocsNav onNavigate={() => setNavOpen(false)} />
            </div>
          </div>
        )}

        {/* Content */}
        <main
          id="docs-content"
          tabIndex={-1}
          className={cn(
            "min-w-0 flex-1 px-4 py-8 focus:outline-none sm:px-8 lg:px-12",
          )}
        >
          <div className="mx-auto w-full max-w-3xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
