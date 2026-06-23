import { Settings } from "lucide-react";
import { PagePlaceholder } from "@/components/dashboard/page-placeholder";

export const metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <PagePlaceholder
      icon={Settings}
      title="Settings"
      description="Configure your workspace, team access, billing, notifications, and integrations."
    />
  );
}
