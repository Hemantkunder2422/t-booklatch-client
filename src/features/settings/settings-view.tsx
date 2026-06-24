"use client";

import { useState } from "react";
import {
  CalendarCheck,
  CalendarX2,
  Check,
  CircleDollarSign,
  Mail,
  MessageSquare,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import { WhatsappIcon } from "@/features/onboarding/brand-icons";
import { PAYMENT_GATEWAYS } from "@/features/onboarding/data";
import { cn } from "@/lib/utils";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const NOTIFICATION_PREFS = [
  {
    id: "bookings",
    title: "Booking confirmations",
    description: "When a booking is created, changed, or cancelled.",
    default: true,
  },
  {
    id: "enquiries",
    title: "New enquiries",
    description: "When a prospective customer sends an enquiry.",
    default: true,
  },
  {
    id: "payments",
    title: "Payment alerts",
    description: "Deposits, payouts, and failed charges.",
    default: true,
  },
  {
    id: "summary",
    title: "Weekly summary",
    description: "A Monday digest of last week's activity.",
    default: false,
  },
  {
    id: "product",
    title: "Product updates",
    description: "New features and occasional tips.",
    default: false,
  },
];

const COMM_EVENTS = [
  { icon: CalendarCheck, label: "Venue booked" },
  { icon: CalendarX2, label: "Booking cancelled" },
  { icon: CircleDollarSign, label: "Pending payments" },
];

const COMM_CHANNELS = [
  {
    id: "whatsapp" as const,
    title: "WhatsApp",
    description: "Instant alerts to your WhatsApp number.",
    icon: <WhatsappIcon className="size-5 rounded" />,
  },
  {
    id: "sms" as const,
    title: "Message (SMS)",
    description: "Text messages to your phone.",
    icon: <MessageSquare className="size-4" />,
  },
  {
    id: "email" as const,
    title: "Email",
    description: "Notifications to your inbox.",
    icon: <Mail className="size-4" />,
  },
];

type CommState = {
  enabled: boolean;
  whatsapp: boolean;
  sms: boolean;
  email: boolean;
};

export function SettingsView() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIFICATION_PREFS.map((p) => [p.id, p.default])),
  );
  const [twoFactor, setTwoFactor] = useState(false);
  const [comm, setComm] = useState<CommState>({
    enabled: true,
    whatsapp: false,
    sms: false,
    email: true,
  });
  const [payments, setPayments] = useState({
    gateway: "stripe",
    connected: true,
    upiEnabled: true,
    upiId: "aurora-events@okhdfcbank",
    depositPct: "25",
    payoutSchedule: "weekly",
  });
  const gatewayMeta =
    PAYMENT_GATEWAYS.find((g) => g.value === payments.gateway) ??
    PAYMENT_GATEWAYS[0];

  return (
    <>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your workspace, notifications, and security.
        </p>
      </div>

      <Tabs defaultValue="general" className="gap-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* General */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workspace</CardTitle>
              <CardDescription>
                Basic information about your organization.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="ws-name">Workspace name</Label>
                <Input id="ws-name" defaultValue="Aurora Events" />
              </div>
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select defaultValue="pst">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pst">Pacific (PST)</SelectItem>
                    <SelectItem value="est">Eastern (EST)</SelectItem>
                    <SelectItem value="gmt">London (GMT)</SelectItem>
                    <SelectItem value="ist">India (IST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select defaultValue="usd">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">USD — $</SelectItem>
                    <SelectItem value="eur">EUR — €</SelectItem>
                    <SelectItem value="gbp">GBP — £</SelectItem>
                    <SelectItem value="inr">INR — ₹</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="justify-end border-t">
              <Button onClick={() => toast.success("Workspace settings saved")}>
                Save changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Communication */}
        <TabsContent value="communication" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Communication</CardTitle>
              <CardDescription>
                Get notified when a venue is booked, cancelled, or has pending
                payments.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Master toggle */}
              <div className="flex items-center justify-between gap-4 rounded-xl border bg-muted/30 p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="comm-enabled" className="font-medium">
                    Enable communication
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Turn on alerts across your selected channels.
                  </p>
                </div>
                <Switch
                  id="comm-enabled"
                  checked={comm.enabled}
                  onCheckedChange={(v) =>
                    setComm((c) => ({ ...c, enabled: v }))
                  }
                />
              </div>

              {/* Events covered */}
              <div className="flex flex-wrap gap-2">
                {COMM_EVENTS.map((event) => (
                  <span
                    key={event.label}
                    className="inline-flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground"
                  >
                    <event.icon className="size-3.5" />
                    {event.label}
                  </span>
                ))}
              </div>

              {/* Channels */}
              <div
                className={cn(
                  "divide-y rounded-xl border transition-opacity",
                  !comm.enabled && "pointer-events-none opacity-50",
                )}
              >
                {COMM_CHANNELS.map((channel) => (
                  <div
                    key={channel.id}
                    className="flex items-center justify-between gap-4 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        {channel.icon}
                      </span>
                      <div className="space-y-0.5">
                        <Label
                          htmlFor={`comm-${channel.id}`}
                          className="font-medium"
                        >
                          {channel.title}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {channel.description}
                        </p>
                      </div>
                    </div>
                    <Switch
                      id={`comm-${channel.id}`}
                      checked={comm[channel.id]}
                      disabled={!comm.enabled}
                      onCheckedChange={(v) =>
                        setComm((c) => ({ ...c, [channel.id]: v }))
                      }
                    />
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="justify-end border-t">
              <Button
                onClick={() => toast.success("Communication settings saved")}
              >
                Save changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Payments */}
        <TabsContent value="payments" className="space-y-6">
          {/* Gateway */}
          <Card>
            <CardHeader>
              <CardTitle>Payment gateway</CardTitle>
              <CardDescription>
                Connect a provider to collect deposits and payments.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between gap-4 rounded-xl border p-4">
                <div className="flex items-center gap-3">
                  <gatewayMeta.icon className="size-10 rounded-lg" />
                  <div>
                    <p className="font-medium">{gatewayMeta.name}</p>
                    <p
                      className={cn(
                        "flex items-center gap-1 text-xs",
                        payments.connected
                          ? "text-success"
                          : "text-muted-foreground",
                      )}
                    >
                      {payments.connected ? (
                        <>
                          <Check className="size-3.5" /> Connected
                        </>
                      ) : (
                        "Not connected"
                      )}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={payments.connected}
                  onCheckedChange={(v) =>
                    setPayments((p) => ({ ...p, connected: v }))
                  }
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Provider</Label>
                  <Select
                    value={payments.gateway}
                    onValueChange={(v) =>
                      setPayments((p) => ({ ...p, gateway: v }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_GATEWAYS.map((g) => (
                        <SelectItem key={g.value} value={g.value}>
                          {g.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="api-key">API secret key</Label>
                  <Input
                    id="api-key"
                    type="password"
                    defaultValue="sk_live_51Hb...92Kf"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end border-t">
              <Button onClick={() => toast.success("Gateway settings saved")}>
                Save changes
              </Button>
            </CardFooter>
          </Card>

          {/* UPI */}
          <Card>
            <CardHeader>
              <CardTitle>UPI payments</CardTitle>
              <CardDescription>
                Accept instant UPI payments (GPay, PhonePe, Paytm & more).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4 rounded-xl border bg-muted/30 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-success/15 text-success">
                    <Smartphone className="size-5" />
                  </span>
                  <div className="space-y-0.5">
                    <Label htmlFor="upi-enabled" className="font-medium">
                      Enable UPI
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Let customers pay via any UPI app.
                    </p>
                  </div>
                </div>
                <Switch
                  id="upi-enabled"
                  checked={payments.upiEnabled}
                  onCheckedChange={(v) =>
                    setPayments((p) => ({ ...p, upiEnabled: v }))
                  }
                />
              </div>
              <div
                className={cn(
                  "space-y-2 transition-opacity",
                  !payments.upiEnabled && "pointer-events-none opacity-50",
                )}
              >
                <Label htmlFor="upi-id">UPI ID (VPA)</Label>
                <Input
                  id="upi-id"
                  placeholder="yourbusiness@bank"
                  value={payments.upiId}
                  onChange={(e) =>
                    setPayments((p) => ({ ...p, upiId: e.target.value }))
                  }
                  disabled={!payments.upiEnabled}
                />
              </div>
            </CardContent>
            <CardFooter className="justify-end border-t">
              <Button onClick={() => toast.success("UPI settings saved")}>
                Save changes
              </Button>
            </CardFooter>
          </Card>

          {/* Deposits & payouts */}
          <Card>
            <CardHeader>
              <CardTitle>Deposits & payouts</CardTitle>
              <CardDescription>
                Set how much you collect upfront and when you get paid.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="deposit-pct">Default deposit (%)</Label>
                <Input
                  id="deposit-pct"
                  inputMode="numeric"
                  value={payments.depositPct}
                  onChange={(e) =>
                    setPayments((p) => ({
                      ...p,
                      depositPct: e.target.value.replace(/[^0-9]/g, ""),
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Payout schedule</Label>
                <Select
                  value={payments.payoutSchedule}
                  onValueChange={(v) =>
                    setPayments((p) => ({ ...p, payoutSchedule: v }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Payout account</Label>
                <div className="flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm">
                  <span className="flex items-center gap-2">
                    <CircleDollarSign className="size-4 text-muted-foreground" />
                    Bank account •••• 4242
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toast.info("Update isn't wired up in the demo.")}
                  >
                    Update
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end border-t">
              <Button onClick={() => toast.success("Payout settings saved")}>
                Save changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email notifications</CardTitle>
              <CardDescription>
                Choose what BookLatch emails you about.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y border-t">
                {NOTIFICATION_PREFS.map((pref) => (
                  <div
                    key={pref.id}
                    className="flex items-center justify-between gap-4 px-6 py-4"
                  >
                    <div className="space-y-0.5">
                      <Label htmlFor={pref.id} className="font-medium">
                        {pref.title}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {pref.description}
                      </p>
                    </div>
                    <Switch
                      id={pref.id}
                      checked={prefs[pref.id]}
                      onCheckedChange={(v) =>
                        setPrefs((p) => ({ ...p, [pref.id]: v }))
                      }
                    />
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="justify-end border-t">
              <Button onClick={() => toast.success("Notification preferences saved")}>
                Save preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Update the password for your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 sm:max-w-md">
              <div className="space-y-2">
                <Label htmlFor="current">Current password</Label>
                <Input id="current" type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new">New password</Label>
                <Input id="new" type="password" placeholder="••••••••" />
              </div>
            </CardContent>
            <CardFooter className="justify-end border-t">
              <Button onClick={() => toast.success("Password updated")}>
                Update password
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Two-factor authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security to your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="font-medium">Authenticator app</p>
                  <p className="text-sm text-muted-foreground">
                    Use a TOTP app to generate verification codes.
                  </p>
                </div>
                <Switch
                  checked={twoFactor}
                  onCheckedChange={(v) => {
                    setTwoFactor(v);
                    toast.success(v ? "Two-factor enabled" : "Two-factor disabled");
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="text-destructive">Danger zone</CardTitle>
              <CardDescription>
                Irreversible actions for your workspace.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-0.5">
                  <p className="font-medium">Delete workspace</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently remove this workspace and all its data.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => toast.error("This action is disabled in the demo.")}
                >
                  Delete workspace
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
