"use client";

import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusScreen } from "@/components/status-screen";
import "./globals.css";

/**
 * Catches errors thrown in the root layout itself. It replaces the layout,
 * so it must render its own <html> and <body>.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <StatusScreen
          code="500"
          title="Something went wrong"
          description="A critical error occurred while loading the app. Please try again."
          footer={error.digest ? `Reference: ${error.digest}` : undefined}
        >
          <Button onClick={reset}>
            <RotateCw className="size-4" />
            Reload app
          </Button>
        </StatusScreen>
      </body>
    </html>
  );
}
