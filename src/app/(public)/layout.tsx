import { GuestGuard } from "@/features/auth/route-guards";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <GuestGuard>{children}</GuestGuard>;
}
