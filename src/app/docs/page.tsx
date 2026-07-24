import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ROLES, SCENARIOS } from "@/features/docs/content";
import { ROLE_ICON } from "@/features/docs/icons";
import { MentalModel } from "@/features/docs/mental-model";
import { ScenarioCard } from "@/features/docs/scenario-card";

export default function DocsHome() {
  return (
    <div className="space-y-14">
      {/* Hero */}
      <header className="space-y-4">
        <p className="text-sm font-medium text-muted-foreground">
          BookLatch documentation
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Run your venue.
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-ink-muted">
          Most product docs are a tour of the menu. These aren&apos;t. They&apos;re
          organized around the moments you actually live —{" "}
          <span className="text-foreground">an enquiry just came in</span>,{" "}
          <span className="text-foreground">the quote got accepted</span>,{" "}
          <span className="text-foreground">it&apos;s month-end</span> — and each
          one walks you through whatever it touches, in order.
        </p>
      </header>

      {/* Mental model */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight">
              How it fits together
            </h2>
            <p className="text-sm text-muted-foreground">
              Five stages, one date, one customer. Learn this once and the rest
              is obvious.
            </p>
          </div>
          <Link
            href="/docs/concepts"
            className="hidden shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline sm:inline-flex"
          >
            Full breakdown
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <MentalModel />
      </section>

      {/* Roles */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">
            Start with your role
          </h2>
          <p className="text-sm text-muted-foreground">
            A short, ordered path to the job you were hired to do.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {ROLES.map((role) => {
            const Icon = ROLE_ICON[role.id];
            return (
              <Link
                key={role.id}
                href={`/docs/roles/${role.id}`}
                className="group flex flex-col gap-3 rounded-xl border bg-card p-5 transition-colors hover:border-hairline-strong hover:bg-accent/40"
              >
                <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Icon className="size-4.5" />
                </span>
                <div className="space-y-1">
                  <h3 className="font-semibold tracking-tight text-foreground">
                    {role.name}
                  </h3>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {role.tagline}
                  </p>
                </div>
                <span className="mt-auto inline-flex items-center gap-1 pt-1 text-xs font-medium text-ink-tertiary">
                  {role.path.length} steps
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Scenarios */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">
            Browse by scenario
          </h2>
          <p className="text-sm text-muted-foreground">
            Every guide is a real venue moment. Jump straight to yours.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {SCENARIOS.map((scenario) => (
            <ScenarioCard key={scenario.slug} scenario={scenario} />
          ))}
        </div>
      </section>
    </div>
  );
}
