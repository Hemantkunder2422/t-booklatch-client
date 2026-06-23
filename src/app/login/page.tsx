import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/login-form";
import { LoginBrandPanel } from "@/features/auth/login-brand-panel";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your BookLatch venue management workspace.",
};

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Branded showcase panel — hidden on small screens */}
      <LoginBrandPanel />

      {/* Form column */}
      <div className="relative flex flex-col items-center justify-center px-6 py-12">
        <div className="absolute top-5 right-5">
          <ThemeToggle />
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
