"use client";

import Link from "next/link";
import { Home, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusScreen } from "@/components/status-screen";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <StatusScreen
      code="500"
      title="Something went wrong"
      description="An unexpected error occurred. You can try again, or head back home."
      footer={error.digest ? `Reference: ${error.digest}` : undefined}
    >
      <Button onClick={reset}>
        <RotateCw className="size-4" />
        Try again
      </Button>
      <Button variant="outline" asChild>
        <Link href="/">
          <Home className="size-4" />
          Back to dashboard
        </Link>
      </Button>
    </StatusScreen>
  );
}
