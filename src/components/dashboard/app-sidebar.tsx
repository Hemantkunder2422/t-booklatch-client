"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import {
  Building2,
  CalendarCheck,
  CalendarDays,
  Check,
  ChevronsUpDown,
  Contact,
  DoorOpen,
  FileText,
  Inbox,
  LayoutDashboard,
  LogOut,
  Package,
  Plus,
  Settings,
  Sparkles,
  User,
  Users,
  UsersRound,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { getInitials } from "@/lib/utils";

const MAIN_NAV = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Bookings", href: "/bookings", icon: CalendarCheck },
  { title: "Invoices", href: "/invoices", icon: FileText },
  { title: "Enquiries", href: "/enquiries", icon: Inbox },
  { title: "Customers", href: "/customers", icon: Users },
  { title: "Contacts", href: "/contacts", icon: Contact },
  { title: "Calendars", href: "/calendars", icon: CalendarDays },
  { title: "My Spaces", href: "/spaces", icon: DoorOpen },
  { title: "Packages", href: "/packages", icon: Package },
  { title: "Staff", href: "/staff", icon: UsersRound },
];

const VENUES = [
  { id: "v1", name: "Aurora Events", city: "San Francisco" },
  { id: "v2", name: "Riverside Pavilion", city: "Austin" },
  { id: "v3", name: "The Glasshouse", city: "New York" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [activeVenue, setActiveVenue] = useState(VENUES[0]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Sidebar collapsible="icon">
      {/* Venue switcher */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <VenueSwitcher
              active={activeVenue}
              onSelect={setActiveVenue}
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Main navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarMenu>
            {MAIN_NAV.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(item.href)}
                  tooltip={item.title}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* User menu */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <UserMenu />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

function VenueSwitcher({
  active,
  onSelect,
}: {
  active: (typeof VENUES)[number];
  onSelect: (venue: (typeof VENUES)[number]) => void;
}) {
  const { isMobile } = useSidebar();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-linear-to-br from-primary to-chart-4 text-sidebar-primary-foreground">
            <Building2 className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{active.name}</span>
            <span className="truncate text-xs text-muted-foreground">
              {active.city}
            </span>
          </div>
          <ChevronsUpDown className="ml-auto size-4" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        align="start"
        side={isMobile ? "bottom" : "right"}
        sideOffset={4}
      >
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Switch venue
        </DropdownMenuLabel>
        {VENUES.map((venue) => (
          <DropdownMenuItem
            key={venue.id}
            onClick={() => onSelect(venue)}
            className="gap-2 p-2"
          >
            <div className="flex size-6 items-center justify-center rounded-md border bg-card text-xs font-medium">
              {getInitials(venue.name)}
            </div>
            <span className="flex-1 truncate">{venue.name}</span>
            {venue.id === active.id && <Check className="size-4" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="gap-2 p-2">
          <Link href="/onboarding">
            <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
              <Plus className="size-4" />
            </div>
            <span className="text-muted-foreground">Add venue</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserMenu() {
  const router = useRouter();
  const { isMobile } = useSidebar();
  const user = { name: "Jordan Lee", email: "jordan@aurora-events.com" };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Avatar className="size-8 rounded-lg">
            <AvatarFallback className="rounded-lg bg-linear-to-br from-primary to-chart-4 text-primary-foreground">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{user.name}</span>
            <span className="truncate text-xs text-muted-foreground">
              {user.email}
            </span>
          </div>
          <ChevronsUpDown className="ml-auto size-4" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        side={isMobile ? "bottom" : "right"}
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="flex items-center gap-2 p-2 font-normal">
          <Avatar className="size-8 rounded-lg">
            <AvatarFallback className="rounded-lg bg-linear-to-br from-primary to-chart-4 text-primary-foreground">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{user.name}</span>
            <span className="truncate text-xs text-muted-foreground">
              {user.email}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 text-primary">
          <Sparkles className="size-4" />
          Upgrade plan
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild className="gap-2">
            <Link href="/profile">
              <User className="size-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="gap-2">
            <Link href="/settings">
              <Settings className="size-4" />
              Settings
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="gap-2 text-destructive focus:text-destructive"
          onClick={() => router.push("/login")}
        >
          <LogOut className="size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
