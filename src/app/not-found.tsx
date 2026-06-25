import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusScreen } from "@/components/status-screen";

export default function NotFound() {
  return (
    <StatusScreen
      code="404"
      title="Page not found"
      description="The page you're looking for doesn't exist or may have been moved."
    >
      <Button asChild>
        <Link href="/">
          <Home className="size-4" />
          Back to dashboard
        </Link>
      </Button>
      <Button variant="outline" asChild>
        <Link href="/login">
          <ArrowLeft className="size-4" />
          Go to sign in
        </Link>
      </Button>
    </StatusScreen>
  );
}
