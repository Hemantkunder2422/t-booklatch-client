"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DoorOpen, Pencil, Plus, Users } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatCurrency, getInitials } from "@/lib/utils";

type SpaceStatus = "active" | "maintenance" | "draft";

interface Space {
  id: string;
  name: string;
  type: string;
  capacity: string;
  price: string;
  status: SpaceStatus;
}

const SPACE_TYPES = [
  "Ballroom",
  "Conference",
  "Garden",
  "Rooftop",
  "Lounge",
  "Dining",
];

const STATUS_META: Record<SpaceStatus, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-success/15 text-success" },
  maintenance: {
    label: "Maintenance",
    className: "bg-warning/15 text-warning-foreground dark:text-warning",
  },
  draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
};

const INITIAL: Space[] = [
  {
    id: "sp-1",
    name: "Grand Atrium Hall",
    type: "Ballroom",
    capacity: "850",
    price: "4200",
    status: "active",
  },
  {
    id: "sp-2",
    name: "Riverside Pavilion",
    type: "Garden",
    capacity: "320",
    price: "1900",
    status: "active",
  },
  {
    id: "sp-3",
    name: "The Glasshouse Loft",
    type: "Lounge",
    capacity: "140",
    price: "2600",
    status: "maintenance",
  },
  {
    id: "sp-4",
    name: "Skyline Rooftop",
    type: "Rooftop",
    capacity: "200",
    price: "3100",
    status: "draft",
  },
];

const spaceSchema = z.object({
  name: z.string().trim().min(2, "Space name is required"),
  type: z.string().min(1, "Choose a type"),
  capacity: z.string().trim().min(1, "Add a capacity"),
  price: z.string().trim().min(1, "Add a price"),
  status: z.enum(["active", "maintenance", "draft"]),
});
type SpaceValues = z.infer<typeof spaceSchema>;

let spaceCounter = 5;

export function SpacesView() {
  const [spaces, setSpaces] = useState<Space[]>(INITIAL);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Space | null>(null);

  function openAdd() {
    setEditing(null);
    setDialogOpen(true);
  }
  function openEdit(space: Space) {
    setEditing(space);
    setDialogOpen(true);
  }

  function handleSubmit(values: SpaceValues) {
    if (editing) {
      setSpaces((prev) =>
        prev.map((s) => (s.id === editing.id ? { ...s, ...values } : s)),
      );
      toast.success("Space updated", { description: values.name });
    } else {
      setSpaces((prev) => [
        { id: `sp-${spaceCounter++}`, ...values },
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
                <span
                  className={cn(
                    "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                    STATUS_META[space.status].className,
                  )}
                >
                  {STATUS_META[space.status].label}
                </span>
              </div>
              <div className="mt-3 space-y-0.5">
                <h3 className="font-semibold leading-tight">{space.name}</h3>
                <p className="text-sm text-muted-foreground">{space.type}</p>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex items-center justify-between border-t pt-4 text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="size-4" />
                  {Number(space.capacity).toLocaleString()}
                </span>
                <span className="font-semibold">
                  {formatCurrency(Number(space.price))}
                  <span className="text-xs font-normal text-muted-foreground">
                    /day
                  </span>
                </span>
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

        {/* Add tile */}
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
  editing: Space | null;
  onSubmit: (values: SpaceValues) => void;
}) {
  const form = useForm<SpaceValues>({
    resolver: zodResolver(spaceSchema),
    defaultValues: {
      name: "",
      type: "",
      capacity: "",
      price: "",
      status: "active",
    },
  });

  // Sync form with the space being edited whenever the dialog opens.
  useEffect(() => {
    if (open) {
      form.reset(
        editing
          ? {
              name: editing.name,
              type: editing.type,
              capacity: editing.capacity,
              price: editing.price,
              status: editing.status,
            }
          : {
              name: "",
              type: "",
              capacity: "",
              price: "",
              status: "active",
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
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SPACE_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity</FormLabel>
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
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price / day</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        placeholder="2500"
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
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
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
