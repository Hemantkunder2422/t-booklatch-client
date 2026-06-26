"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DoorOpen, ImageIcon, Pencil, Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn, getInitials } from "@/lib/utils";
import type { VenueSpace } from "@/types/models";

const SLOT_TOGGLES = [
  { key: "morningSlotEnabled", label: "Morning" },
  { key: "eveningSlotEnabled", label: "Evening" },
  { key: "fullDaySlotEnabled", label: "Full day" },
] as const;

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
    gallery: ["1", "2", "3"],
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
    gallery: ["1", "2"],
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
    gallery: [],
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
        prev.map((s) =>
          s.id === editing.id ? { ...s, ...values, pax } : s,
        ),
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
        {spaces.map((space) => (
          <Card key={space.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex size-11 items-center justify-center rounded-xl bg-linear-to-br from-primary to-chart-4 text-sm font-semibold text-primary-foreground">
                  {getInitials(space.name)}
                </div>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <ImageIcon className="size-3.5" />
                  {space.gallery.length}
                </span>
              </div>
              <div className="mt-3 space-y-1">
                <h3 className="font-semibold leading-tight">{space.name}</h3>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {space.description}
                </p>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-3">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Users className="size-4" />
                Up to {space.pax.toLocaleString()} guests
              </div>
              <div className="flex flex-wrap gap-1.5 border-t pt-3">
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
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1.5"
                onClick={() => openEdit(space)}
              >
                <Pencil className="size-3.5" />
                Edit
              </Button>
            </CardFooter>
          </Card>
        ))}

        <button
          type="button"
          onClick={openAdd}
          className="flex min-h-44 flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/40 hover:text-foreground"
        >
          <div className="flex size-11 items-center justify-center rounded-xl bg-muted">
            <DoorOpen className="size-5" />
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit space" : "Add space"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Update this space's details."
              : "Create a new bookable space for your venue."}
          </DialogDescription>
        </DialogHeader>
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
        <DialogFooter>
          <Button type="submit" form="space-form">
            {editing ? "Save changes" : "Add space"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
