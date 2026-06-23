"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import {
  Armchair,
  DollarSign,
  Plus,
  Trees,
  Trash2,
  Users,
  Warehouse,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AMENITIES, SPACE_TYPES } from "../data";
import { ImageUploader } from "../image-uploader";
import type { OnboardingValues } from "../schema";
import type { SpaceLayout } from "../types";

const LAYOUTS: { value: SpaceLayout; label: string; icon: typeof Warehouse }[] =
  [
    { value: "indoor", label: "Indoor", icon: Warehouse },
    { value: "outdoor", label: "Outdoor", icon: Trees },
    { value: "hybrid", label: "Hybrid", icon: Armchair },
  ];

let spaceCounter = 2;

export function SpacesStep() {
  const form = useFormContext<OnboardingValues>();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "spaces",
  });

  return (
    <div className="space-y-5">
      {fields.map((field, index) => {
        const name = form.watch(`spaces.${index}.name`);
        return (
          <div
            key={field.id}
            className="relative overflow-hidden rounded-2xl border bg-card/50 shadow-sm"
          >
            {/* Gradient accent strip */}
            <div className="h-1 w-full bg-linear-to-r from-primary to-chart-4" />
            <div className="space-y-5 p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-linear-to-br from-primary to-chart-4 text-xs font-semibold text-primary-foreground">
                    {index + 1}
                  </span>
                  <h3 className="text-sm font-semibold">
                    {name?.trim() || `Space ${index + 1}`}
                  </h3>
                </div>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-destructive"
                    onClick={() => remove(index)}
                    aria-label="Remove space"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>

              <FormField
                control={form.control}
                name={`spaces.${index}.name`}
                render={({ field: f }) => (
                  <FormItem>
                    <FormLabel>
                      Space name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Main Ballroom" {...f} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Space type — selectable icon cards */}
              <FormField
                control={form.control}
                name={`spaces.${index}.type`}
                render={({ field: f }) => (
                  <FormItem>
                    <FormLabel>
                      Space type <span className="text-destructive">*</span>
                    </FormLabel>
                    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
                      {SPACE_TYPES.map(({ value, label, icon: Icon }) => {
                        const selected = f.value === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => f.onChange(value)}
                            className={cn(
                              "group flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-center transition-all",
                              selected
                                ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                                : "border-border hover:-translate-y-0.5 hover:border-primary/40 hover:bg-muted/50",
                            )}
                          >
                            <span
                              className={cn(
                                "flex size-8 items-center justify-center rounded-lg transition-colors",
                                selected
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground group-hover:text-foreground",
                              )}
                            >
                              <Icon className="size-4" />
                            </span>
                            <span className="text-xs font-medium">{label}</span>
                          </button>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Layout */}
              <FormField
                control={form.control}
                name={`spaces.${index}.layout`}
                render={({ field: f }) => (
                  <FormItem>
                    <FormLabel>Layout</FormLabel>
                    <div className="grid grid-cols-3 gap-2.5">
                      {LAYOUTS.map(({ value, label, icon: Icon }) => {
                        const selected = f.value === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => f.onChange(value)}
                            className={cn(
                              "flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all",
                              selected
                                ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/30"
                                : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                            )}
                          >
                            <Icon className="size-4" />
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </FormItem>
                )}
              />

              {/* Capacities + price */}
              <div className="grid gap-4 sm:grid-cols-3">
                <NumericField
                  index={index}
                  fieldName="seatedCapacity"
                  label="Seated"
                  placeholder="120"
                  icon={<Armchair className="size-4" />}
                />
                <NumericField
                  index={index}
                  fieldName="standingCapacity"
                  label="Standing"
                  placeholder="200"
                  icon={<Users className="size-4" />}
                />
                <NumericField
                  index={index}
                  fieldName="pricePerDay"
                  label="Price / day"
                  placeholder="2,500"
                  icon={<DollarSign className="size-4" />}
                />
              </div>

              {/* Amenities */}
              <FormField
                control={form.control}
                name={`spaces.${index}.amenities`}
                render={({ field: f }) => {
                  const selected: string[] = f.value ?? [];
                  const toggle = (a: string) =>
                    f.onChange(
                      selected.includes(a)
                        ? selected.filter((x) => x !== a)
                        : [...selected, a],
                    );
                  return (
                    <FormItem>
                      <FormLabel>Amenities</FormLabel>
                      <div className="flex flex-wrap gap-2">
                        {AMENITIES.map((amenity) => {
                          const active = selected.includes(amenity);
                          return (
                            <button
                              key={amenity}
                              type="button"
                              onClick={() => toggle(amenity)}
                              className={cn(
                                "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                                active
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                              )}
                            >
                              {amenity}
                            </button>
                          );
                        })}
                      </div>
                    </FormItem>
                  );
                }}
              />

              {/* Photos */}
              <FormField
                control={form.control}
                name={`spaces.${index}.images`}
                render={({ field: f }) => (
                  <FormItem>
                    <FormLabel>Photos</FormLabel>
                    <ImageUploader
                      value={f.value ?? []}
                      onChange={f.onChange}
                    />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );
      })}

      <Button
        type="button"
        variant="outline"
        onClick={() =>
          append({
            id: `space-${spaceCounter++}`,
            name: "",
            type: "",
            layout: "indoor",
            seatedCapacity: "",
            standingCapacity: "",
            pricePerDay: "",
            amenities: [],
            images: [],
          })
        }
        className="w-full border-dashed"
      >
        <Plus className="size-4" />
        Add another space
      </Button>
    </div>
  );
}

function NumericField({
  index,
  fieldName,
  label,
  placeholder,
  icon,
}: {
  index: number;
  fieldName: "seatedCapacity" | "standingCapacity" | "pricePerDay";
  label: string;
  placeholder: string;
  icon: React.ReactNode;
}) {
  const form = useFormContext<OnboardingValues>();
  return (
    <FormField
      control={form.control}
      name={`spaces.${index}.${fieldName}`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
              {icon}
            </span>
            <FormControl>
              <Input
                inputMode="numeric"
                placeholder={placeholder}
                {...field}
                onChange={(e) =>
                  field.onChange(e.target.value.replace(/[^0-9,]/g, ""))
                }
                className="pl-9"
              />
            </FormControl>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
