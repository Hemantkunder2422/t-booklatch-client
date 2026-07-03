"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ImageIcon, Pencil, Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { VenueSpace } from "@/types/models";

const SLOT_TOGGLES = [
  { key: "morningSlotEnabled", label: "Morning" },
  { key: "eveningSlotEnabled", label: "Evening" },
  { key: "fullDaySlotEnabled", label: "Full day" },
] as const;

// Gradient placeholders for gallery photos (swap for real `gallery` URLs later).
const GRADIENTS = [
  "bg-[linear-gradient(135deg,#6d5bf5,#b15bf0)]",
  "bg-[linear-gradient(135deg,#0ea5e9,#22d3ee)]",
  "bg-[linear-gradient(135deg,#f59e0b,#ef4444)]",
  "bg-[linear-gradient(135deg,#10b981,#0ea5e9)]",
  "bg-[linear-gradient(135deg,#ec4899,#8b5cf6)]",
  "bg-[linear-gradient(135deg,#f43f5e,#fb923c)]",
];

const INITIAL: VenueSpace[] = [
  {
    id: "sp-1",
    venueId: "v-1",
    name: "Grand Atrium Hall",
    description: "A soaring glass atrium for weddings and galas.",
    morningSlotEnabled: true,
    eveningSlotEnabled: true,
    fullDaySlotEnabled: true,
    pax: 850,
    gallery: ["a", "b", "c", "d"],
  },
  {
    id: "sp-2",
    venueId: "v-1",
    name: "Riverside Pavilion",
    description: "Open-air pavilion overlooking the river.",
    morningSlotEnabled: true,
    eveningSlotEnabled: true,
    fullDaySlotEnabled: false,
    pax: 320,
    gallery: ["a", "b", "c"],
  },
  {
    id: "sp-3",
    venueId: "v-1",
    name: "The Glasshouse Loft",
    description: "An intimate loft with skyline views.",
    morningSlotEnabled: false,
    eveningSlotEnabled: true,
    fullDaySlotEnabled: true,
    pax: 140,
    gallery: ["a", "b"],
  },
];

const spaceSchema = z.object({
  name: z.string().trim().min(2, "Space name is required"),
  description: z.string().trim().min(1, "Add a short description"),
  pax: z.string().trim().min(1, "Add a capacity"),
  morningSlotEnabled: z.boolean(),
  eveningSlotEnabled: z.boolean(),
  fullDaySlotEnabled: z.boolean(),
});
type SpaceValues = z.infer<typeof spaceSchema>;

let spaceCounter = 4;

export function SpacesView() {
  const [spaces, setSpaces] = useState<VenueSpace[]>(INITIAL);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<VenueSpace | null>(null);

  function openAdd() {
    setEditing(null);
    setDialogOpen(true);
  }
  function openEdit(space: VenueSpace) {
    setEditing(space);
    setDialogOpen(true);
  }

  function handleSubmit(values: SpaceValues) {
    const pax = Number(values.pax.replace(/[^0-9]/g, "")) || 0;
    if (editing) {
      setSpaces((prev) =>
        prev.map((s) => (s.id === editing.id ? { ...s, ...values, pax } : s)),
      );
      toast.success("Space updated", { description: values.name });
    } else {
      setSpaces((prev) => [
        {
          id: `sp-${spaceCounter++}`,
          venueId: "v-1",
          gallery: [],
          ...values,
          pax,
        },
        ...prev,
      ]);
      toast.success("Space added", { description: values.name });
    }
    setDialogOpen(false);
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">My Spaces</h1>
          <p className="text-muted-foreground">
            Manage the bookable spaces in your venue.
          </p>
        </div>
        <Button className="gap-1.5" onClick={openAdd}>
          <Plus className="size-4" />
          Add space
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {spaces.map((space, idx) => (
          <Card key={space.id} className="flex flex-col overflow-hidden p-0">
            {/* Photo gallery */}
            <div className="relative">
              <SpaceGallery gallery={space.gallery} seed={idx} />
              <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-md bg-black/50 px-1.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
                <ImageIcon className="size-3" />
                {space.gallery.length}
              </span>
            </div>

            {/* Details */}
            <div className="flex flex-1 flex-col p-4">
              <h3 className="font-semibold leading-tight">{space.name}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {space.description}
              </p>

              <div className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Users className="size-4" />
                Up to {space.pax.toLocaleString()} guests
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5 border-t pt-3">
                {SLOT_TOGGLES.map((slot) => {
                  const on = space[slot.key];
                  return (
                    <span
                      key={slot.key}
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        on
                          ? "bg-success/15 text-success"
                          : "bg-muted text-muted-foreground line-through",
                      )}
                    >
                      {slot.label}
                    </span>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full gap-1.5"
                onClick={() => openEdit(space)}
              >
                <Pencil className="size-3.5" />
                Edit
              </Button>
            </div>
          </Card>
        ))}

        <button
          type="button"
          onClick={openAdd}
          className="flex min-h-64 flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/40 hover:text-foreground"
        >
          <div className="flex size-11 items-center justify-center rounded-xl bg-muted">
            <Plus className="size-5" />
          </div>
          <span className="text-sm font-medium">Add a new space</span>
        </button>
      </div>

      <SpaceFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        onSubmit={handleSubmit}
      />
    </>
  );
}

function SpaceGallery({
  gallery,
  seed,
}: {
  gallery: string[];
  seed: number;
}) {
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Append a clone of the first slide so we can loop forward seamlessly.
  const slides =
    gallery.length > 1 ? [...gallery, gallery[0]] : gallery;

  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
    },
    [],
  );

  // Re-enable the transition on the frame after an instant snap-back.
  useEffect(() => {
    if (!animate) {
      const id = requestAnimationFrame(() => setAnimate(true));
      return () => cancelAnimationFrame(id);
    }
  }, [animate]);

  function start() {
    if (gallery.length <= 1) return;
    timer.current = setInterval(() => setIndex((i) => i + 1), 1300);
  }
  function stop() {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setIndex(0);
  }
  function handleTransitionEnd() {
    // Reached the cloned first slide → snap back to the real first with no anim.
    if (index === slides.length - 1 && gallery.length > 1) {
      setAnimate(false);
      setIndex(0);
    }
  }

  if (gallery.length === 0) {
    return (
      <div className="flex aspect-16/10 flex-col items-center justify-center gap-1 bg-muted text-muted-foreground">
        <ImageIcon className="size-6" />
        <span className="text-xs">No photos yet</span>
      </div>
    );
  }

  const activeDot = index % gallery.length;

  return (
    <div
      className="group/gallery relative aspect-16/10 overflow-hidden"
      onMouseEnter={start}
      onMouseLeave={stop}
    >
      <div
        className={cn(
          "flex h-full",
          animate && "transition-transform duration-500 ease-out",
        )}
        style={{ transform: `translateX(-${index * 100}%)` }}
        onTransitionEnd={handleTransitionEnd}
      >
        {slides.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className={cn(
              "relative h-full w-full shrink-0",
              GRADIENTS[(seed + (i % gallery.length)) % GRADIENTS.length],
            )}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.32),transparent_55%)]" />
          </div>
        ))}
      </div>

      {/* Slide indicators */}
      {gallery.length > 1 && (
        <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1">
          {gallery.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1 rounded-full bg-white/60 transition-all",
                i === activeDot ? "w-4 bg-white" : "w-1",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SpaceFormDialog({
  open,
  onOpenChange,
  editing,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: VenueSpace | null;
  onSubmit: (values: SpaceValues) => void;
}) {
  const form = useForm<SpaceValues>({
    resolver: zodResolver(spaceSchema),
    defaultValues: {
      name: "",
      description: "",
      pax: "",
      morningSlotEnabled: true,
      eveningSlotEnabled: true,
      fullDaySlotEnabled: true,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset(
        editing
          ? {
              name: editing.name,
              description: editing.description,
              pax: String(editing.pax),
              morningSlotEnabled: editing.morningSlotEnabled,
              eveningSlotEnabled: editing.eveningSlotEnabled,
              fullDaySlotEnabled: editing.fullDaySlotEnabled,
            }
          : {
              name: "",
              description: "",
              pax: "",
              morningSlotEnabled: true,
              eveningSlotEnabled: true,
              fullDaySlotEnabled: true,
            },
      );
    }
  }, [open, editing, form]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{editing ? "Edit space" : "Add space"}</SheetTitle>
          <SheetDescription>
            {editing
              ? "Update this space's details."
              : "Create a new bookable space for your venue."}
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            id="space-form"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Space name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Main Ballroom" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={2}
                      placeholder="What makes this space special…"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pax"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity (pax)</FormLabel>
                  <FormControl>
                    <Input
                      inputMode="numeric"
                      placeholder="200"
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

            <div className="space-y-2">
              <Label>Available slots</Label>
              <div className="divide-y rounded-xl border">
                {SLOT_TOGGLES.map((slot) => (
                  <FormField
                    key={slot.key}
                    control={form.control}
                    name={slot.key}
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between gap-3 p-3">
                        <FormLabel className="font-normal">
                          {slot.label} slot
                        </FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>
          </form>
        </Form>
        </div>
        <SheetFooter>
          <Button type="submit" form="space-form">
            {editing ? "Save changes" : "Add space"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
