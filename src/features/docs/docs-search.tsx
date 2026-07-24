"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { SEARCH_INDEX } from "./content";

/**
 * ⌘K / Ctrl-K command palette over the docs index. Renders its own trigger
 * button (for the header) and manages open state, so the whole search
 * experience is a single self-contained island.
 */
export function DocsSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const openRef = useRef(false);
  const listRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SEARCH_INDEX;
    const terms = q.split(/\s+/);
    return SEARCH_INDEX.filter((item) => {
      const haystack = [
        item.title,
        item.description ?? "",
        item.group,
        ...(item.keywords ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return terms.every((t) => haystack.includes(t));
    });
  }, [query]);

  // Open/close the palette, resetting query + cursor whenever it opens. Kept in
  // one place so the trigger, the ⌘K shortcut, and Radix all share it.
  const toggle = useCallback((next: boolean) => {
    openRef.current = next;
    setOpen(next);
    if (next) {
      setQuery("");
      setActive(0);
    }
  }, []);

  // Global shortcut.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggle(!openRef.current);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  // Keep the highlighted row in view (DOM side effect only).
  useEffect(() => {
    listRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const go = useCallback(
    (href: string) => {
      toggle(false);
      router.push(href);
    },
    [router, toggle],
  );

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const r = results[active];
      if (r) go(r.href);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => toggle(true)}
        aria-label="Search documentation"
        className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-transparent px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:w-56 dark:bg-input/30"
      >
        <Search className="size-4 shrink-0" />
        <span className="hidden flex-1 text-left sm:inline">Search docs…</span>
        <kbd className="ml-auto hidden rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground sm:inline">
          ⌘K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={toggle}>
        <DialogContent
          showCloseButton={false}
          className="top-[12%] max-w-xl translate-y-0 gap-0 overflow-hidden p-0"
        >
          <DialogTitle className="sr-only">Search documentation</DialogTitle>
          <div className="flex items-center gap-2 border-b px-4">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={onInputKeyDown}
              placeholder="Search scenarios, roles, concepts…"
              className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              aria-label="Search documentation"
            />
            <kbd className="hidden shrink-0 rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">
              Esc
            </kbd>
          </div>

          <div ref={listRef} className="max-h-80 overflow-y-auto p-2">
            {results.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                No results for “{query}”.
              </p>
            ) : (
              results.map((r, i) => (
                <button
                  key={r.href}
                  type="button"
                  data-active={i === active}
                  onClick={() => go(r.href)}
                  onMouseMove={() => setActive(i)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors",
                    i === active ? "bg-accent" : "hover:bg-accent/50",
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {r.title}
                    </p>
                    {r.description && (
                      <p className="truncate text-xs text-muted-foreground">
                        {r.description}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-[11px] text-ink-tertiary">
                    {r.group}
                  </span>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
