import Link from "next/link";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusScreen } from "@/components/status-screen";

export default function DashboardNotFound() {
  return (
    <StatusScreen
      code="404"
      title="Not found"
      description="We couldn't find what you were looking for in your workspace."
      className="min-h-[70vh]"
    >
      <Button asChild>
        <Link href="/">
          <Home className="size-4" />
          Dashboard home
        </Link>
      </Button>
    </StatusScreen>
  );
}
