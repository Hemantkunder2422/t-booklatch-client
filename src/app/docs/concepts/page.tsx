import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { CONCEPTS } from "@/features/docs/content";
import { MentalModel } from "@/features/docs/mental-model";

export const metadata: Metadata = {
  title: "How it fits together",
  description:
    "The one mental model behind BookLatch: Venue, Space, Enquiry, Quote, Booking, Invoice, Payment — and how they connect.",
};

export default function ConceptsPage() {
  return (
    <div className="space-y-12">
      <header className="space-y-4">
        <p className="text-sm font-medium text-muted-foreground">Start here</p>
        <h1 className="text-3xl font-semibold tracking-tight">
          How BookLatch fits together
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-ink-muted">
          BookLatch has a handful of moving parts, and they connect in one
          predictable way. Spend two minutes here and every scenario afterward
          will feel like something you already knew.
        </p>
      </header>

      <MentalModel />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">The pieces</h2>
        <dl className="divide-y divide-border overflow-hidden rounded-xl border">
          {CONCEPTS.map((concept) => (
            <div
              key={concept.id}
              className="grid gap-1 bg-card p-5 sm:grid-cols-[10rem_1fr] sm:gap-6"
            >
              <dt className="space-y-0.5">
                <span className="font-semibold text-foreground">
                  {concept.name}
                </span>
                <p className="text-xs leading-5 text-ink-tertiary">
                  {concept.short}
                </p>
              </dt>
              <dd className="text-sm leading-6 text-ink-muted">
                {concept.detail}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-surface-1 p-5">
        <div>
          <p className="font-semibold text-foreground">Ready for the real thing?</p>
          <p className="text-sm text-muted-foreground">
            Pick your role and follow the path, or browse a scenario.
          </p>
        </div>
        <Link
          href="/docs"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Choose a starting point
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
