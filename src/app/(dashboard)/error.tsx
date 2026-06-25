"use client";

import Link from "next/link";
import { Home, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusScreen } from "@/components/status-screen";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <StatusScreen
      code="500"
      title="Couldn't load this page"
      description="Something went wrong while loading your workspace. Try again in a moment."
      footer={error.digest ? `Reference: ${error.digest}` : undefined}
      className="min-h-[70vh]"
    >
      <Button onClick={reset}>
        <RotateCw className="size-4" />
        Try again
      </Button>
      <Button variant="outline" asChild>
        <Link href="/">
          <Home className="size-4" />
          Dashboard home
        </Link>
      </Button>
    </StatusScreen>
  );
}
