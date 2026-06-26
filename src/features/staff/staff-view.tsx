"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  BadgeCheck,
  Copy,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  UserCog,
} from "lucide-react";
import { toast } from "sonner";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, getInitials } from "@/lib/utils";
import { ROLE_LABELS, type Role, type StaffUser } from "@/types/models";

// Roles assignable from the venue staff screen.
const ASSIGNABLE_ROLES: Role[] = [
  "VENUE_ADMIN",
  "VENUE_STAFF",
  "ADMIN",
  "SUPPORT",
];
const INVITE_ROLES: Role[] = ["VENUE_STAFF", "ADMIN", "SUPPORT"];

// The workspace owner — protected from role changes / removal.
const OWNER_ID = "st-1";

const INITIAL: StaffUser[] = [
  {
    id: "st-1",
    name: "Jordan Lee",
    email: "jordan@aurora-events.com",
    userType: "VENUE",
    role: "VENUE_ADMIN",
    venueId: "v-1",
    isActive: true,
    isVerified: true,
  },
  {
    id: "st-2",
    name: "Sarah Chen",
    email: "sarah.chen@aurora-events.com",
    userType: "VENUE",
    role: "ADMIN",
    venueId: "v-1",
    isActive: true,
    isVerified: true,
  },
  {
    id: "st-3",
    name: "Diego Martin",
    email: "diego@aurora-events.com",
    userType: "VENUE",
    role: "VENUE_STAFF",
    venueId: "v-1",
    isActive: true,
    isVerified: false,
  },
  {
    id: "st-4",
    name: "Mia Wong",
    email: "mia@aurora-events.com",
    userType: "VENUE",
    role: "VENUE_STAFF",
    venueId: "v-1",
    isActive: false,
    isVerified: false,
  },
];

const staffSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  role: z.enum(["VENUE_STAFF", "ADMIN", "SUPPORT"]),
});
type StaffValues = z.infer<typeof staffSchema>;

let staffCounter = 5;

export function StaffView() {
  const [staff, setStaff] = useState<StaffUser[]>(INITIAL);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(
    () =>
      staff.filter(
        (s) =>
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          s.email.toLowerCase().includes(query.toLowerCase()),
      ),
    [staff, query],
  );

  const activeCount = staff.filter((s) => s.isActive).length;

  function setRole(id: string, role: Role) {
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, role } : s)));
    toast.success("Role updated", { description: ROLE_LABELS[role] });
  }
  function toggleActive(id: string, isActive: boolean) {
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, isActive } : s)));
    toast.success(isActive ? "Member activated" : "Member deactivated");
  }
  function remove(id: string) {
    setStaff((prev) => prev.filter((s) => s.id !== id));
    toast.success("Member removed");
  }
  function addStaff(values: StaffValues) {
    setStaff((prev) => [
      {
        id: `st-${staffCounter++}`,
        name: values.name,
        email: values.email,
        userType: "VENUE",
        role: values.role,
        venueId: "v-1",
        isActive: true,
        isVerified: false,
      },
      ...prev,
    ]);
    setOpen(false);
    toast.success("Staff member invited", { description: values.name });
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Staff</h1>
          <p className="text-muted-foreground">
            Manage your team, assign roles, and control access.
          </p>
        </div>
        <AddStaffDialog open={open} onOpenChange={setOpen} onSubmit={addStaff} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search staff…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {activeCount} active · {staff.length} total
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Member</TableHead>
              <TableHead className="w-44">Role</TableHead>
              <TableHead className="w-36">Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((member) => {
              const isOwner = member.id === OWNER_ID;
              return (
                <TableRow key={member.id}>
                  <TableCell>
                    <div
                      className={cn(
                        "flex items-center gap-3",
                        !member.isActive && "opacity-50",
                      )}
                    >
                      <Avatar className="size-9">
                        <AvatarFallback className="bg-linear-to-br from-primary to-chart-4 text-xs font-semibold text-primary-foreground">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 truncate font-medium">
                          {member.name}
                          {member.isVerified && (
                            <BadgeCheck className="size-3.5 text-primary" />
                          )}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {member.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={member.role}
                      onValueChange={(v) => setRole(member.id, v as Role)}
                      disabled={isOwner}
                    >
                      <SelectTrigger className="w-full" size="sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ASSIGNABLE_ROLES.map((role) => (
                          <SelectItem key={role} value={role}>
                            {ROLE_LABELS[role]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={member.isActive}
                        onCheckedChange={(v) => toggleActive(member.id, v)}
                        disabled={isOwner}
                        aria-label="Toggle active"
                      />
                      <span
                        className={cn(
                          "text-sm",
                          member.isActive
                            ? "text-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        {member.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          aria-label="More actions"
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            navigator.clipboard?.writeText(member.email);
                            toast.success("Email copied");
                          }}
                        >
                          <Copy className="size-4" />
                          Copy email
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={isOwner}
                          onClick={() =>
                            toggleActive(member.id, !member.isActive)
                          }
                        >
                          <UserCog className="size-4" />
                          {member.isActive ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          disabled={isOwner}
                          onClick={() => remove(member.id)}
                        >
                          <Trash2 className="size-4" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  No staff found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

function AddStaffDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: StaffValues) => void;
}) {
  const form = useForm<StaffValues>({
    resolver: zodResolver(staffSchema),
    defaultValues: { name: "", email: "", role: "VENUE_STAFF" },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) form.reset();
      }}
    >
      <DialogTrigger asChild>
        <Button className="gap-1.5">
          <Plus className="size-4" />
          Add staff
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add staff member</DialogTitle>
          <DialogDescription>
            Invite a teammate and assign their role.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            id="staff-form"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input placeholder="Full name" {...field} />
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
                    <Input type="email" placeholder="name@venue.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {INVITE_ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {ROLE_LABELS[role]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button type="submit" form="staff-form">
            Send invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
