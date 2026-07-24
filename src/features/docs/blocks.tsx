import { AlertTriangle, Check, Info, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Block, CalloutTone } from "./types";

/** Turn a heading string into a stable anchor id. */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const CALLOUT: Record<
  CalloutTone,
  { icon: typeof Info; ring: string; tint: string; iconColor: string; label: string }
> = {
  tip: {
    icon: Lightbulb,
    ring: "border-success/30",
    tint: "bg-success/10",
    iconColor: "text-success",
    label: "Tip",
  },
  note: {
    icon: Info,
    ring: "border-info/30",
    tint: "bg-info/10",
    iconColor: "text-info",
    label: "Note",
  },
  warning: {
    icon: AlertTriangle,
    ring: "border-warning/40",
    tint: "bg-warning/10",
    iconColor: "text-warning",
    label: "Heads up",
  },
};

/**
 * Renders one structured content block. Kept deliberately small — the point of
 * the content model is that every docs page looks the same because it flows
 * through this one renderer.
 */
export function BlockView({ block }: { block: Block }) {
  switch (block.kind) {
    case "prose":
      return (
        <p className="text-[15px] leading-7 text-ink-muted">{block.text}</p>
      );

    case "heading":
      return (
        <h2
          id={slugify(block.text)}
          className="scroll-mt-24 pt-2 text-lg font-semibold tracking-tight text-foreground"
        >
          {block.text}
        </h2>
      );

    case "steps":
      return (
        <ol className="space-y-4">
          {block.items.map((step, i) => (
            <li key={i} className="flex gap-4">
              <span
                aria-hidden="true"
                className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
              >
                {i + 1}
              </span>
              <div className="space-y-1">
                <p className="font-medium text-foreground">{step.title}</p>
                {step.detail && (
                  <p className="text-sm leading-6 text-muted-foreground">
                    {step.detail}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      );

    case "callout": {
      const c = CALLOUT[block.tone];
      const Icon = c.icon;
      return (
        <div className={cn("flex gap-3 rounded-lg border p-4", c.ring, c.tint)}>
          <Icon className={cn("mt-0.5 size-5 shrink-0", c.iconColor)} />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              {block.title ?? c.label}
            </p>
            <p className="text-sm leading-6 text-ink-muted">{block.text}</p>
          </div>
        </div>
      );
    }

    case "keypoints":
      return (
        <div className="rounded-lg border bg-surface-1 p-5">
          {block.title && (
            <p className="mb-3 text-sm font-semibold text-foreground">
              {block.title}
            </p>
          )}
          <ul className="space-y-2.5">
            {block.items.map((item, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-ink-muted">
                <Check className="mt-0.5 size-4 shrink-0 text-success" />
                <span className="leading-6">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      );

    default:
      return null;
  }
}

/** Render an ordered list of blocks with consistent vertical rhythm. */
export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block, i) => (
        <BlockView key={i} block={block} />
      ))}
    </div>
  );
}
