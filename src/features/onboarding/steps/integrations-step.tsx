"use client";

import { useFormContext } from "react-hook-form";
import { Check, CreditCard, MessageCircle } from "lucide-react";
import {
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { COMMUNICATION_CHANNELS, PAYMENT_GATEWAYS } from "../data";
import type { OnboardingValues } from "../schema";

export function IntegrationsStep() {
  const form = useFormContext<OnboardingValues>();

  return (
    <div className="space-y-8">
      {/* Payment gateway — single select */}
      <section className="space-y-3.5">
        <SectionHeader
          icon={<CreditCard className="size-4" />}
          title="Payment gateway"
          subtitle="Pick one provider to collect deposits and payments."
          required
        />
        <FormField
          control={form.control}
          name="integrations.paymentGateway"
          render={({ field }) => (
            <FormItem>
              <div className="grid gap-3 sm:grid-cols-2">
                {PAYMENT_GATEWAYS.map((gw) => {
                  const selected = field.value === gw.value;
                  return (
                    <SelectableCard
                      key={gw.value}
                      selected={selected}
                      shape="circle"
                      onClick={() => field.onChange(gw.value)}
                      icon={<gw.icon className="size-10 shrink-0 rounded-lg" />}
                      name={gw.name}
                      description={gw.description}
                    />
                  );
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </section>

      {/* Communication channels — multi select */}
      <section className="space-y-3.5">
        <SectionHeader
          icon={<MessageCircle className="size-4" />}
          title="Communication channels"
          subtitle="Choose how BookLatch keeps your guests in the loop."
        />
        <FormField
          control={form.control}
          name="integrations.channels"
          render={({ field }) => {
            const selected: string[] = field.value ?? [];
            const toggle = (v: string) =>
              field.onChange(
                selected.includes(v)
                  ? selected.filter((x) => x !== v)
                  : [...selected, v],
              );
            return (
              <FormItem>
                <div className="grid gap-3 sm:grid-cols-2">
                  {COMMUNICATION_CHANNELS.map((ch) => (
                    <SelectableCard
                      key={ch.value}
                      selected={selected.includes(ch.value)}
                      shape="square"
                      onClick={() => toggle(ch.value)}
                      icon={
                        <span
                          className={cn(
                            "flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted",
                            ch.accent,
                          )}
                        >
                          <ch.icon className="size-5" />
                        </span>
                      }
                      name={ch.name}
                      description={ch.description}
                    />
                  ))}
                </div>
              </FormItem>
            );
          }}
        />
      </section>
    </div>
  );
}

function SelectableCard({
  selected,
  shape,
  onClick,
  icon,
  name,
  description,
}: {
  selected: boolean;
  shape: "circle" | "square";
  onClick: () => void;
  icon: React.ReactNode;
  name: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-3.5 rounded-xl border p-4 text-left transition-all",
        selected
          ? "border-primary bg-primary/5 ring-1 ring-primary/30 shadow-sm"
          : "border-border hover:-translate-y-0.5 hover:border-primary/40 hover:bg-muted/40 hover:shadow-sm",
      )}
    >
      {icon}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{name}</p>
        <p className="truncate text-xs text-muted-foreground">{description}</p>
      </div>
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center border transition-all",
          shape === "circle" ? "rounded-full" : "rounded-md",
          selected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/30",
        )}
      >
        {selected && <Check className="size-3.5" />}
      </span>
    </button>
  );
}

function SectionHeader({
  icon,
  title,
  subtitle,
  required,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  required?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        {icon}
      </span>
      <div>
        <h3 className="text-sm font-semibold">
          {title}
          {required && <span className="ml-1 text-destructive">*</span>}
        </h3>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}
