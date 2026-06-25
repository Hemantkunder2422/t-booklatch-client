import type { Metadata } from "next";
import { BookLatchLogo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { AcceptInvite } from "@/features/invite/accept-invite";

export const metadata: Metadata = {
  title: "Accept your invitation",
  description: "Join your team's venue management workspace on BookLatch.",
};

export default async function InvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token = "" } = await searchParams;

  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-background">
        {/* Soft color orbs */}
        <div className="absolute top-[-12%] left-1/2 size-[44rem] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute bottom-[-18%] right-[-8%] size-[34rem] rounded-full bg-chart-4/15 blur-[110px]" />
        <div className="absolute bottom-[-10%] left-[-10%] size-[26rem] rounded-full bg-chart-2/10 blur-[110px]" />
        {/* Dotted grid, fading toward the edges */}
        <div
          className="absolute inset-0 opacity-[0.4] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,black,transparent)]"
          style={{
            backgroundImage:
              "radial-gradient(circle, var(--color-border) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />
      </div>

      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-5">
        <BookLatchLogo textClassName="text-base" />
        <ThemeToggle />
      </header>

      {/* Centered invite card */}
      <main className="flex flex-1 items-center justify-center px-6 pb-16">
        <div className="w-full max-w-md">
          {/* Gradient ring wrapper */}
          <div className="relative rounded-[1.75rem] bg-linear-to-b from-primary/25 via-border to-transparent p-px shadow-2xl shadow-primary/10">
            <div className="relative overflow-hidden rounded-[calc(1.75rem-1px)] bg-card/85 p-8 backdrop-blur-xl sm:p-10">
              {/* Top sheen */}
              <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent" />
              <AcceptInvite token={token} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
