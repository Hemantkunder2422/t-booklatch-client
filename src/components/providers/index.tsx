"use client";

import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";

/** Single entry point that wires every client-side provider together. */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryProvider>
        {children}
        <Toaster richColors position="top-right" />
      </QueryProvider>
    </ThemeProvider>
  );
}
