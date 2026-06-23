export function SectionCard({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border bg-card/40 p-5 shadow-sm shadow-black/[0.02] sm:p-6">
      <header className="mb-5 flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
          {icon}
        </span>
        <div className="space-y-0.5">
          <h3 className="text-sm font-semibold leading-none">{title}</h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </header>
      {children}
    </section>
  );
}
