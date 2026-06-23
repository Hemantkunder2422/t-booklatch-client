import { User } from "lucide-react";
import { PagePlaceholder } from "@/components/dashboard/page-placeholder";

export const metadata = { title: "Profile" };

export default function ProfilePage() {
  return (
    <PagePlaceholder
      icon={User}
      title="Profile"
      description="Update your personal details, avatar, and how teammates see you across the workspace."
    />
  );
}
