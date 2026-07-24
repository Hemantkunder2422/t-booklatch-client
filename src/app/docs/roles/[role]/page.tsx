import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRole, getScenario, ROLES } from "@/features/docs/content";
import { ROLE_ICON } from "@/features/docs/icons";
import { ScenarioCard } from "@/features/docs/scenario-card";

export function generateStaticParams() {
  return ROLES.map((role) => ({ role: role.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ role: string }>;
}): Promise<Metadata> {
  const { role } = await params;
  const found = getRole(role);
  if (!found) return { title: "Role not found" };
  return {
    title: `${found.name} — start here`,
    description: found.intro,
  };
}

export default async function RolePage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role } = await params;
  const found = getRole(role);
  if (!found) notFound();

  const Icon = ROLE_ICON[found.id];
  const steps = found.path
    .map((slug) => getScenario(slug))
    .filter((s) => s !== undefined);

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <p className="text-sm font-medium text-muted-foreground">
          Guide by role
        </p>
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <Icon className="size-5" />
          </span>
          <h1 className="text-3xl font-semibold tracking-tight">{found.name}</h1>
        </div>
        <p className="max-w-2xl text-lg leading-8 text-ink-muted">
          {found.intro}
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Your path</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {steps.map((scenario, i) => (
            <ScenarioCard
              key={scenario.slug}
              scenario={scenario}
              index={i + 1}
            />
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-surface-1 p-5">
        <div>
          <p className="font-semibold text-foreground">
            New to how BookLatch works?
          </p>
          <p className="text-sm text-muted-foreground">
            The mental model makes every step above click into place.
          </p>
        </div>
        <Link
          href="/docs/concepts"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          How it fits together
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
