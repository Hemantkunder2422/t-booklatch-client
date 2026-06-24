"use client";

import { useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getInitials } from "@/lib/utils";

const profileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  title: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  bio: z
    .string()
    .max(280, "Keep it under 280 characters")
    .optional()
    .or(z.literal("")),
});
type ProfileValues = z.infer<typeof profileSchema>;

export function ProfileView() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState<string | null>(null);

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "Jordan",
      lastName: "Lee",
      email: "jordan@aurora-events.com",
      title: "Operations Lead",
      phone: "+1 (415) 555-0148",
      bio: "Running events at Aurora Events. Coffee, calendars, and clean floor plans.",
    },
  });

  const firstName = useWatch({ control: form.control, name: "firstName" });
  const lastName = useWatch({ control: form.control, name: "lastName" });
  const fullName = `${firstName ?? ""} ${lastName ?? ""}`.trim();

  function onPickFile(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (avatar) URL.revokeObjectURL(avatar);
    setAvatar(URL.createObjectURL(file));
  }

  function removeAvatar() {
    if (avatar) URL.revokeObjectURL(avatar);
    setAvatar(null);
  }

  function onSubmit(values: ProfileValues) {
    toast.success("Profile saved", {
      description: `${values.firstName} ${values.lastName}`,
    });
  }

  return (
    <>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Update your personal details and photo.
        </p>
      </div>

      {/* Profile photo */}
      <Card>
        <CardHeader>
          <CardTitle>Profile photo</CardTitle>
          <CardDescription>
            PNG or JPG, at least 200×200px. Shown across your workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-5 sm:flex-row">
          <Avatar className="size-20 ring-4 ring-muted">
            {avatar && <AvatarImage src={avatar} alt={fullName} />}
            <AvatarFallback className="bg-linear-to-br from-primary to-chart-4 text-xl font-semibold text-primary-foreground">
              {getInitials(fullName) || "JL"}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col items-center gap-2 sm:items-start">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => inputRef.current?.click()}
              >
                <Upload className="size-4" />
                Upload photo
              </Button>
              {avatar && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-muted-foreground hover:text-destructive"
                  onClick={removeAvatar}
                >
                  <Trash2 className="size-4" />
                  Remove
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Recommended: square image, max 2MB.
            </p>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              onPickFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </CardContent>
      </Card>

      {/* Personal information */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Personal information</CardTitle>
              <CardDescription>
                This information may be visible to your team.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input type="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Job title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="justify-end border-t">
              <Button type="submit">Save profile</Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </>
  );
}
