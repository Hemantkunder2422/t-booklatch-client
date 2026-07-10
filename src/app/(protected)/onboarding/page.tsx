import type { Metadata } from "next";
import { ThemeToggle } from "@/components/theme-toggle";
import { OnboardingWizard } from "@/features/onboarding/onboarding-wizard";

export const metadata: Metadata = {
  title: "Venue onboarding",
  description: "Set up your venue, spaces, and integrations on BookLatch.",
};

export default function OnboardingPage() {
  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <OnboardingWizard />
    </div>
  );
}
