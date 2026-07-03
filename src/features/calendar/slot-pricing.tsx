"use client";

import { useState } from "react";
import { IndianRupee, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import { BOOKING_SLOT_LABELS, type BookingSlot } from "@/types/models";
import {
  hasOverride,
  monthKeys,
  parseInputDate,
  parseInputMonth,
  priceFor,
  PRICE_SLOTS,
  rangeKeys,
  type PricingState,
} from "./pricing";
import { dateKey } from "./utils";

/** Rupee-prefixed numeric input. */
function PriceInput({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="relative">
        <IndianRupee className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ""))}
          className="h-9 pl-7"
        />
      </div>
    </div>
  );
}

/* ── Per-day editor (day-wise, single-slot pricing) ──────────────── */

export function DaySlotPricing({
  date,
  pricing,
  onSave,
  onReset,
}: {
  date: Date;
  pricing: PricingState;
  onSave: (key: string, prices: Record<BookingSlot, number>) => void;
  onReset: (key: string) => void;
}) {
  const key = dateKey(date);
  const custom = hasOverride(pricing, key);
  const [vals, setVals] = useState<Record<BookingSlot, string>>(() => ({
    MORNING: String(priceFor(pricing, key, "MORNING")),
    EVENING: String(priceFor(pricing, key, "EVENING")),
    FULL_DAY: String(priceFor(pricing, key, "FULL_DAY")),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Slot pricing</CardTitle>
        <CardDescription>
          {date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
          {custom && " · custom"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {PRICE_SLOTS.map((slot) => (
          <div key={slot} className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">
              {BOOKING_SLOT_LABELS[slot]}
            </span>
            <PriceInput
              className="w-32"
              value={vals[slot]}
              onChange={(v) => setVals((s) => ({ ...s, [slot]: v }))}
            />
          </div>
        ))}
      </CardContent>
      <CardFooter className="gap-2">
        {custom && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onReset(key);
              setVals({
                MORNING: String(pricing.base.MORNING),
                EVENING: String(pricing.base.EVENING),
                FULL_DAY: String(pricing.base.FULL_DAY),
              });
              toast.success("Reset to default pricing");
            }}
          >
            Use default
          </Button>
        )}
        <Button
          size="sm"
          className="ml-auto"
          onClick={() => {
            onSave(key, {
              MORNING: Number(vals.MORNING) || 0,
              EVENING: Number(vals.EVENING) || 0,
              FULL_DAY: Number(vals.FULL_DAY) || 0,
            });
            toast.success("Day pricing saved");
          }}
        >
          Save prices
        </Button>
      </CardFooter>
    </Card>
  );
}

/* ── Bulk pricing sheet (range · monthly · defaults) ─────────────── */

type SlotChoice = BookingSlot | "ALL";

export function PricingSheet({
  pricing,
  onApply,
  onSetBase,
}: {
  pricing: PricingState;
  onApply: (keys: string[], slot: SlotChoice, price: number) => void;
  onSetBase: (base: Record<BookingSlot, number>) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-1.5">
          <SlidersHorizontal className="size-4" />
          Manage pricing
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full gap-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Manage slot pricing</SheetTitle>
          <SheetDescription>
            Set prices for a date range, a whole month, or your defaults.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <Tabs defaultValue="range" className="gap-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="range">Range</TabsTrigger>
              <TabsTrigger value="month">Monthly</TabsTrigger>
              <TabsTrigger value="default">Defaults</TabsTrigger>
            </TabsList>

            <TabsContent value="range">
              <RangePricing
                onApply={(keys, slot, price) => {
                  onApply(keys, slot, price);
                  setOpen(false);
                }}
              />
            </TabsContent>
            <TabsContent value="month">
              <MonthPricing
                onApply={(keys, slot, price) => {
                  onApply(keys, slot, price);
                  setOpen(false);
                }}
              />
            </TabsContent>
            <TabsContent value="default">
              <DefaultPricing
                base={pricing.base}
                onSave={(base) => {
                  onSetBase(base);
                  setOpen(false);
                }}
              />
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function SlotSelect({
  value,
  onChange,
}: {
  value: SlotChoice;
  onChange: (v: SlotChoice) => void;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as SlotChoice)}>
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">All slots</SelectItem>
        {PRICE_SLOTS.map((slot) => (
          <SelectItem key={slot} value={slot}>
            {BOOKING_SLOT_LABELS[slot]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function RangePricing({
  onApply,
}: {
  onApply: (keys: string[], slot: SlotChoice, price: number) => void;
}) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [slot, setSlot] = useState<SlotChoice>("ALL");
  const [price, setPrice] = useState("");

  function apply() {
    const f = parseInputDate(from);
    const t = parseInputDate(to);
    const amount = Number(price) || 0;
    if (!f || !t) {
      toast.error("Pick a start and end date.");
      return;
    }
    if (amount <= 0) {
      toast.error("Enter a price.");
      return;
    }
    const keys = rangeKeys(f, t);
    onApply(keys, slot, amount);
    toast.success(
      `Priced ${keys.length} day(s) at ${formatCurrency(amount)}`,
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="range-from">From</Label>
          <Input
            id="range-from"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="range-to">To</Label>
          <Input
            id="range-to"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Slot</Label>
        <SlotSelect value={slot} onChange={setSlot} />
      </div>
      <div className="space-y-1.5">
        <Label>Price per slot</Label>
        <PriceInput value={price} onChange={setPrice} />
      </div>
      <Button className="w-full" onClick={apply}>
        Apply to range
      </Button>
    </div>
  );
}

function MonthPricing({
  onApply,
}: {
  onApply: (keys: string[], slot: SlotChoice, price: number) => void;
}) {
  const [month, setMonth] = useState("");
  const [slot, setSlot] = useState<SlotChoice>("ALL");
  const [price, setPrice] = useState("");

  function apply() {
    const parsed = parseInputMonth(month);
    const amount = Number(price) || 0;
    if (!parsed) {
      toast.error("Pick a month.");
      return;
    }
    if (amount <= 0) {
      toast.error("Enter a price.");
      return;
    }
    const keys = monthKeys(parsed.year, parsed.month);
    onApply(keys, slot, amount);
    toast.success(`Priced the whole month at ${formatCurrency(amount)}`);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="month">Month</Label>
        <Input
          id="month"
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Slot</Label>
        <SlotSelect value={slot} onChange={setSlot} />
      </div>
      <div className="space-y-1.5">
        <Label>Price per slot</Label>
        <PriceInput value={price} onChange={setPrice} />
      </div>
      <Button className="w-full" onClick={apply}>
        Apply to month
      </Button>
    </div>
  );
}

function DefaultPricing({
  base,
  onSave,
}: {
  base: Record<BookingSlot, number>;
  onSave: (base: Record<BookingSlot, number>) => void;
}) {
  const [vals, setVals] = useState<Record<BookingSlot, string>>(() => ({
    MORNING: String(base.MORNING),
    EVENING: String(base.EVENING),
    FULL_DAY: String(base.FULL_DAY),
  }));

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Default prices apply to any day without a custom or bulk override.
      </p>
      {PRICE_SLOTS.map((slot) => (
        <div key={slot} className="space-y-1.5">
          <Label>{BOOKING_SLOT_LABELS[slot]}</Label>
          <PriceInput
            value={vals[slot]}
            onChange={(v) => setVals((s) => ({ ...s, [slot]: v }))}
          />
        </div>
      ))}
      <Button
        className="w-full"
        onClick={() => {
          onSave({
            MORNING: Number(vals.MORNING) || 0,
            EVENING: Number(vals.EVENING) || 0,
            FULL_DAY: Number(vals.FULL_DAY) || 0,
          });
          toast.success("Default pricing saved");
        }}
      >
        Save defaults
      </Button>
    </div>
  );
}
