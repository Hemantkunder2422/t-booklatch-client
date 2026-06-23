import { Building2, CalendarCheck, ShieldCheck, Sparkles } from "lucide-react";

const HIGHLIGHTS = [
  {
    icon: CalendarCheck,
    title: "Smart scheduling",
    description: "Real-time availability across every venue, zero double-bookings.",
  },
  {
    icon: Sparkles,
    title: "Built for growth",
    description: "From a single hall to a nationwide portfolio — one workspace.",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise-grade trust",
    description: "SOC 2 compliant with role-based access and audit trails.",
  },
];

export function LoginBrandPanel() {
  return (
    <div className="relative hidden overflow-hidden bg-linear-to-br from-primary via-primary to-chart-4 text-primary-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
      {/* Decorative glows */}
      <div className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 size-96 rounded-full bg-chart-4/30 blur-3xl" />
      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* Brand */}
      <div className="relative flex items-center gap-2.5">
        <div className="flex size-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur">
          <Building2 className="size-5" />
        </div>
        <span className="text-lg font-semibold tracking-tight">BookLatch</span>
      </div>

      {/* Headline + highlights */}
      <div className="relative max-w-md space-y-8">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight">
            The trusted way to manage every venue.
          </h1>
          <p className="text-primary-foreground/80">
            Bookings, availability, and revenue — beautifully organized in one
            modern platform.
          </p>
        </div>

        <ul className="space-y-5">
          {HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
            <li key={title} className="flex gap-3.5">
              <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/20">
                <Icon className="size-4.5" />
              </div>
              <div className="space-y-0.5">
                <p className="font-medium">{title}</p>
                <p className="text-sm text-primary-foreground/75">
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Testimonial */}
      <figure className="relative max-w-md rounded-2xl bg-white/10 p-5 ring-1 ring-white/15 backdrop-blur">
        <blockquote className="text-sm leading-relaxed text-primary-foreground/90">
          “BookLatch cut our booking admin in half and made our venues look
          effortlessly professional to every client.”
        </blockquote>
        <figcaption className="mt-3 flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-white/20 text-xs font-semibold ring-1 ring-white/25">
            AM
          </div>
          <div className="text-sm">
            <p className="font-medium">Ava Mitchell</p>
            <p className="text-primary-foreground/70">Ops Lead, Aurora Events</p>
          </div>
        </figcaption>
      </figure>
    </div>
  );
}
