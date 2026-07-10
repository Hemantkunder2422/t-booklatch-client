import { AuthGuard } from "@/features/auth/route-guards";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
