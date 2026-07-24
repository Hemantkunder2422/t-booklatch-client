import type { Metadata } from "next";
import { Clock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Blocks } from "@/features/docs/blocks";
import { getScenario, ROLE_LABEL, SCENARIOS } from "@/features/docs/content";
import { ScenarioCard } from "@/features/docs/scenario-card";

export function generateStaticParams() {
  return SCENARIOS.map((scenario) => ({ slug: scenario.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const scenario = getScenario(slug);
  if (!scenario) return { title: "Guide not found" };
  return { title: scenario.title, description: scenario.tagline };
}

export default async function ScenarioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const scenario = getScenario(slug);
  if (!scenario) notFound();

  const related = scenario.related
    .map((s) => getScenario(s))
    .filter((s) => s !== undefined);

  return (
    <article className="space-y-8">
      <header className="space-y-4 border-b pb-8">
        <Link
          href="/docs"
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Scenarios
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">
          {scenario.title}
        </h1>
        <p className="text-lg leading-8 text-ink-muted">{scenario.tagline}</p>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-tertiary">
            <Clock className="size-3.5" />
            {scenario.time} read
          </span>
          <span className="text-ink-tertiary">·</span>
          {scenario.roles.map((role) => (
            <Badge key={role} variant="secondary" className="font-normal">
              {ROLE_LABEL[role]}
            </Badge>
          ))}
          {scenario.touches.map((touch) => (
            <Badge key={touch} variant="outline" className="font-normal">
              {touch}
            </Badge>
          ))}
        </div>
      </header>

      <Blocks blocks={scenario.blocks} />

      {related.length > 0 && (
        <section className="space-y-4 border-t pt-8">
          <h2 className="text-lg font-semibold tracking-tight">
            What usually comes next
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {related.map((r) => (
              <ScenarioCard key={r.slug} scenario={r} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
