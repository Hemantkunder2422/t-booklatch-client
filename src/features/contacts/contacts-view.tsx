"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Phone, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { WhatsappIcon } from "@/features/onboarding/brand-icons";
import { getInitials } from "@/lib/utils";

interface Contact {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  whatsapp: string;
}

const INITIAL: Contact[] = [
  {
    id: "c-1",
    name: "Ava Mitchell",
    role: "Event Planner · Aurora Events",
    phone: "+14155550148",
    email: "ava@aurora-events.com",
    whatsapp: "+14155550148",
  },
  {
    id: "c-2",
    name: "Liam Foster",
    role: "Catering · Forktail Co.",
    phone: "+14155550172",
    email: "liam@forktail.co",
    whatsapp: "",
  },
  {
    id: "c-3",
    name: "Noah Reyes",
    role: "AV & Production",
    phone: "+14155550191",
    email: "noah@stagecraft.io",
    whatsapp: "+14155550191",
  },
];

const contactSchema = z
  .object({
    name: z.string().trim().min(2, "Name is required"),
    role: z.string().optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
    email: z
      .string()
      .email("Enter a valid email")
      .optional()
      .or(z.literal("")),
    whatsapp: z.string().optional().or(z.literal("")),
  })
  .refine((d) => d.phone || d.email || d.whatsapp, {
    message: "Add at least one way to reach this contact",
    path: ["phone"],
  });
type ContactValues = z.infer<typeof contactSchema>;

let contactCounter = 4;

export function ContactsView() {
  const [contacts, setContacts] = useState<Contact[]>(INITIAL);
  const [open, setOpen] = useState(false);

  function handleCreate(values: ContactValues) {
    setContacts((prev) => [
      {
        id: `c-${contactCounter++}`,
        name: values.name,
        role: values.role || "",
        phone: values.phone || "",
        email: values.email || "",
        whatsapp: values.whatsapp || "",
      },
      ...prev,
    ]);
    setOpen(false);
    toast.success("Contact added", { description: values.name });
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground">
            Vendors, planners, and partners — reach them in one tap.
          </p>
        </div>
        <NewContactDialog open={open} onOpenChange={setOpen} onSubmit={handleCreate} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {contacts.map((contact) => (
          <Card key={contact.id}>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="size-11">
                  <AvatarFallback className="bg-linear-to-br from-primary to-chart-4 font-semibold text-primary-foreground">
                    {getInitials(contact.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{contact.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {contact.role || "—"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <ContactAction
                  label="Call"
                  href={contact.phone ? `tel:${contact.phone}` : undefined}
                  icon={<Phone className="size-4" />}
                />
                <ContactAction
                  label="Email"
                  href={contact.email ? `mailto:${contact.email}` : undefined}
                  icon={<Mail className="size-4" />}
                />
                <ContactAction
                  label="WhatsApp"
                  href={
                    contact.whatsapp
                      ? `https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}`
                      : undefined
                  }
                  icon={<WhatsappIcon className="size-4 rounded" />}
                  external
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

function ContactAction({
  label,
  href,
  icon,
  external,
}: {
  label: string;
  href?: string;
  icon: React.ReactNode;
  external?: boolean;
}) {
  if (!href) {
    return (
      <div className="flex flex-col items-center gap-1 rounded-lg border border-dashed py-2 text-muted-foreground/50">
        {icon}
        <span className="text-[11px]">{label}</span>
      </div>
    );
  }
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="flex flex-col items-center gap-1 rounded-lg border py-2 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted/50 hover:text-foreground"
    >
      {icon}
      <span className="text-[11px] font-medium">{label}</span>
    </a>
  );
}

function NewContactDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ContactValues) => void;
}) {
  const form = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", role: "", phone: "", email: "", whatsapp: "" },
  });

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) form.reset();
      }}
    >
      <SheetTrigger asChild>
        <Button className="gap-1.5">
          <Plus className="size-4" />
          Add contact
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full gap-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Add contact</SheetTitle>
          <SheetDescription>
            Save a contact with their preferred channels.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            id="contact-form"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Full name" {...field} />
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
                  <FormLabel>Role / Company</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Caterer · Forktail Co." {...field} />
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
                    <div className="relative">
                      <Phone className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input placeholder="+1 (555) 000-0000" className="pl-9" {...field} />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Add at least one way to reach this contact.
                  </FormDescription>
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
                    <div className="relative">
                      <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="name@company.com"
                        className="pl-9"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="whatsapp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <WhatsappIcon className="pointer-events-none absolute top-1/2 left-2.5 size-5 -translate-y-1/2 rounded" />
                      <Input
                        placeholder="+1 (555) 000-0000"
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        </div>
        <SheetFooter>
          <Button type="submit" form="contact-form">
            Add contact
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
