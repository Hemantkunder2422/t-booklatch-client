import { CalendarCheck, ShieldCheck, Sparkles } from "lucide-react";
import { BookLatchMark } from "@/components/brand/logo";

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
    <div className="brand-surface relative hidden overflow-hidden text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
      {/* Drifting glows */}
      <div className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-white/15 blur-3xl [animation:splash-float_11s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 size-96 rounded-full bg-black/15 blur-3xl [animation:splash-float_14s_ease-in-out_infinite_reverse]" />

      {/* Subtle grid + depth scrim */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_120%,rgba(0,0,0,0.28),transparent_55%)]" />

      {/* Brand */}
      <div className="relative flex items-center gap-2.5">
        <div className="flex size-10 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/25 backdrop-blur">
          <BookLatchMark className="size-6" />
        </div>
        <span className="text-lg font-semibold tracking-tight">BookLatch</span>
      </div>

      {/* Headline + highlights */}
      <div className="relative max-w-md space-y-8">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/85 ring-1 ring-white/15 backdrop-blur">
            <Sparkles className="size-3.5" />
            Venue management, reimagined
          </span>
          <h1 className="text-[2rem] font-semibold leading-[1.15] tracking-tight">
            The trusted way to manage every venue.
          </h1>
          <p className="text-white/75">
            Bookings, availability, and revenue — beautifully organized in one
            modern platform.
          </p>
        </div>

        <ul className="space-y-3">
          {HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
            <li
              key={title}
              className="flex gap-3.5 rounded-xl bg-white/5 p-3 ring-1 ring-white/10 backdrop-blur-sm transition-colors hover:bg-white/10"
            >
              <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/20">
                <Icon className="size-4.5" />
              </div>
              <div className="space-y-0.5">
                <p className="font-medium">{title}</p>
                <p className="text-sm text-white/70">{description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Testimonial */}
      <figure className="relative max-w-md rounded-2xl bg-white/10 p-5 ring-1 ring-white/15 backdrop-blur-md">
        <blockquote className="text-sm leading-relaxed text-white/90">
          “BookLatch cut our booking admin in half and made our venues look
          effortlessly professional to every client.”
        </blockquote>
        <figcaption className="mt-3 flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-white/20 text-xs font-semibold ring-1 ring-white/25">
            AM
          </div>
          <div className="text-sm">
            <p className="font-medium">Ava Mitchell</p>
            <p className="text-white/70">Ops Lead, Aurora Events</p>
          </div>
        </figcaption>
      </figure>
    </div>
  );
}
