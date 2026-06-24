"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Briefcase,
  Check,
  Clock,
  Gem,
  Heart,
  PartyPopper,
  Pencil,
  Plus,
  Presentation,
  Sparkles,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatCurrency } from "@/lib/utils";

interface EventTypeMeta {
  value: string;
  icon: LucideIcon;
  accent: string;
}

const EVENT_TYPES: EventTypeMeta[] = [
  { value: "Wedding", icon: Gem, accent: "bg-chart-4/15 text-chart-4" },
  { value: "Birthday", icon: PartyPopper, accent: "bg-chart-3/15 text-chart-3" },
  { value: "Corporate", icon: Briefcase, accent: "bg-primary/10 text-primary" },
  {
    value: "Conference",
    icon: Presentation,
    accent: "bg-chart-2/15 text-chart-2",
  },
  { value: "Anniversary", icon: Heart, accent: "bg-destructive/10 text-destructive" },
  { value: "Custom", icon: Sparkles, accent: "bg-muted text-muted-foreground" },
];

function eventMeta(value: string): EventTypeMeta {
  return EVENT_TYPES.find((t) => t.value === value) ?? EVENT_TYPES[5];
}

type PackageStatus = "active" | "draft";

interface VenuePackage {
  id: string;
  name: string;
  eventType: string;
  price: string;
  capacity: string;
  duration: string;
  description: string;
  inclusions: string[];
  status: PackageStatus;
}

const INITIAL: VenuePackage[] = [
  {
    id: "pkg-1",
    name: "Forever Begins",
    eventType: "Wedding",
    price: "12500",
    capacity: "250",
    duration: "8",
    description: "An all-inclusive wedding day from ceremony to last dance.",
    inclusions: [
      "Ceremony & reception spaces",
      "Plated dinner for 250",
      "Floral centerpieces & draping",
      "Dedicated event coordinator",
      "Bridal suite access",
    ],
    status: "active",
  },
  {
    id: "pkg-2",
    name: "Big Day Bash",
    eventType: "Birthday",
    price: "3200",
    capacity: "80",
    duration: "5",
    description: "A vibrant birthday celebration with everything handled.",
    inclusions: [
      "Themed decor & balloons",
      "Buffet & custom cake",
      "DJ & sound system",
      "Photo corner",
    ],
    status: "active",
  },
  {
    id: "pkg-3",
    name: "Summit Pro",
    eventType: "Corporate",
    price: "5400",
    capacity: "150",
    duration: "9",
    description: "A full-day corporate offsite, AV and catering included.",
    inclusions: [
      "Full AV & stage setup",
      "Breakfast, lunch & coffee breaks",
      "Breakout rooms",
      "High-speed Wi-Fi",
    ],
    status: "draft",
  },
];

const STATUS_META: Record<PackageStatus, { label: string; className: string }> =
  {
    active: { label: "Active", className: "bg-success/15 text-success" },
    draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
  };

const packageSchema = z.object({
  name: z.string().trim().min(2, "Package name is required"),
  eventType: z.string().min(1, "Choose an event type"),
  price: z.string().trim().min(1, "Add a price"),
  capacity: z.string().trim().min(1, "Add a capacity"),
  duration: z.string().trim().min(1, "Add a duration"),
  description: z.string().optional().or(z.literal("")),
  inclusions: z.array(z.string()).min(1, "Add at least one inclusion"),
  status: z.enum(["active", "draft"]),
});
type PackageValues = z.infer<typeof packageSchema>;

let packageCounter = 4;

export function PackagesView() {
  const [packages, setPackages] = useState<VenuePackage[]>(INITIAL);
  const [filter, setFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<VenuePackage | null>(null);

  const filtered =
    filter === "all"
      ? packages
      : packages.filter((p) => p.eventType === filter);

  function openAdd() {
    setEditing(null);
    setDialogOpen(true);
  }
  function openEdit(pkg: VenuePackage) {
    setEditing(pkg);
    setDialogOpen(true);
  }

  function handleSubmit(values: PackageValues) {
    const normalized: VenuePackage = {
      id: editing?.id ?? `pkg-${packageCounter++}`,
      ...values,
      description: values.description ?? "",
    };
    if (editing) {
      setPackages((prev) =>
        prev.map((p) => (p.id === editing.id ? normalized : p)),
      );
      toast.success("Package updated", { description: values.name });
    } else {
      setPackages((prev) => [normalized, ...prev]);
      toast.success("Package created", { description: values.name });
    }
    setDialogOpen(false);
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Packages</h1>
          <p className="text-muted-foreground">
            Create event packages your customers can book in one click.
          </p>
        </div>
        <Button className="gap-1.5" onClick={openAdd}>
          <Plus className="size-4" />
          Create package
        </Button>
      </div>

      {/* Event-type filter */}
      <div className="flex flex-wrap gap-2">
        <FilterChip
          label="All"
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />
        {EVENT_TYPES.map((type) => (
          <FilterChip
            key={type.value}
            label={type.value}
            icon={type.icon}
            active={filter === type.value}
            onClick={() => setFilter(type.value)}
          />
        ))}
      </div>

      {/* Package grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((pkg) => {
          const meta = eventMeta(pkg.eventType);
          return (
            <Card key={pkg.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={cn(
                      "flex size-11 items-center justify-center rounded-xl",
                      meta.accent,
                    )}
                  >
                    <meta.icon className="size-5" />
                  </span>
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                      STATUS_META[pkg.status].className,
                    )}
                  >
                    {STATUS_META[pkg.status].label}
                  </span>
                </div>
                <div className="mt-3 space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    {pkg.eventType}
                  </span>
                  <h3 className="font-semibold leading-tight">{pkg.name}</h3>
                  <p className="text-lg font-semibold">
                    {formatCurrency(Number(pkg.price))}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Users className="size-3.5" />
                    Up to {Number(pkg.capacity).toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-3.5" />
                    {pkg.duration}h
                  </span>
                </div>
                <ul className="space-y-1.5 border-t pt-3">
                  {pkg.inclusions.slice(0, 4).map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <Check className="mt-0.5 size-3.5 shrink-0 text-success" />
                      <span>{item}</span>
                    </li>
                  ))}
                  {pkg.inclusions.length > 4 && (
                    <li className="pl-5 text-xs text-muted-foreground">
                      +{pkg.inclusions.length - 4} more
                    </li>
                  )}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-1.5"
                  onClick={() => openEdit(pkg)}
                >
                  <Pencil className="size-3.5" />
                  Edit package
                </Button>
              </CardFooter>
            </Card>
          );
        })}

        {/* Add tile */}
        <button
          type="button"
          onClick={openAdd}
          className="flex min-h-52 flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/40 hover:text-foreground"
        >
          <div className="flex size-11 items-center justify-center rounded-xl bg-muted">
            <Plus className="size-5" />
          </div>
          <span className="text-sm font-medium">Create a package</span>
        </button>
      </div>

      <PackageFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        onSubmit={handleSubmit}
      />
    </>
  );
}

function FilterChip({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon?: LucideIcon;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      {Icon && <Icon className="size-3.5" />}
      {label}
    </button>
  );
}

const EMPTY_VALUES: PackageValues = {
  name: "",
  eventType: "",
  price: "",
  capacity: "",
  duration: "",
  description: "",
  inclusions: [],
  status: "active",
};

function PackageFormDialog({
  open,
  onOpenChange,
  editing,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: VenuePackage | null;
  onSubmit: (values: PackageValues) => void;
}) {
  const form = useForm<PackageValues>({
    resolver: zodResolver(packageSchema),
    defaultValues: EMPTY_VALUES,
  });
  const [draft, setDraft] = useState("");

  const inclusions = useWatch({ control: form.control, name: "inclusions" }) ?? [];

  useEffect(() => {
    if (open) {
      form.reset(
        editing
          ? {
              name: editing.name,
              eventType: editing.eventType,
              price: editing.price,
              capacity: editing.capacity,
              duration: editing.duration,
              description: editing.description,
              inclusions: editing.inclusions,
              status: editing.status,
            }
          : EMPTY_VALUES,
      );
    }
  }, [open, editing, form]);

  function addInclusion() {
    const value = draft.trim();
    if (!value) return;
    form.setValue("inclusions", [...inclusions, value], {
      shouldValidate: true,
    });
    setDraft("");
  }

  function removeInclusion(index: number) {
    form.setValue(
      "inclusions",
      inclusions.filter((_, i) => i !== index),
      { shouldValidate: true },
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setDraft("");
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit package" : "Create package"}
          </DialogTitle>
          <DialogDescription>
            Bundle a space, capacity, and inclusions for an event type.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            id="package-form"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Package name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Forever Begins" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="eventType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EVENT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        placeholder="5000"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value.replace(/[^0-9]/g, ""))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        placeholder="150"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value.replace(/[^0-9]/g, ""))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hours</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        placeholder="8"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value.replace(/[^0-9]/g, ""))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={2}
                      placeholder="What makes this package special…"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Inclusions */}
            <FormField
              control={form.control}
              name="inclusions"
              render={() => (
                <FormItem>
                  <FormLabel>What&apos;s included</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addInclusion();
                        }
                      }}
                      placeholder="e.g. Plated dinner for 200"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addInclusion}
                      className="shrink-0"
                    >
                      <Plus className="size-4" />
                      Add
                    </Button>
                  </div>
                  {inclusions.length > 0 && (
                    <ul className="mt-2 space-y-1.5">
                      {inclusions.map((item, index) => (
                        <li
                          key={`${item}-${index}`}
                          className="flex items-center justify-between gap-2 rounded-lg border bg-muted/40 px-3 py-1.5 text-sm"
                        >
                          <span className="flex items-center gap-2">
                            <Check className="size-3.5 text-success" />
                            {item}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeInclusion(index)}
                            aria-label="Remove inclusion"
                            className="text-muted-foreground transition-colors hover:text-destructive"
                          >
                            <X className="size-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button type="submit" form="package-form">
            {editing ? "Save changes" : "Create package"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
