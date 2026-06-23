"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  Building2,
  Check,
  Clock,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatDate, getInitials } from "@/lib/utils";
import {
  acceptInviteSchema,
  type AcceptInviteValues,
} from "@/features/auth/schema";
import { RoleBadge } from "./role-badge";
import { useAcceptInvite, useInvite } from "./use-invite";

export function AcceptInvite({ token }: { token: string }) {
  const router = useRouter();
  const { data: invite, isLoading, isError } = useInvite(token);
  const acceptInvite = useAcceptInvite();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<AcceptInviteValues>({
    resolver: zodResolver(acceptInviteSchema),
    defaultValues: { username: "", password: "", confirmPassword: "" },
    mode: "onChange",
  });

  const password = useWatch({ control: form.control, name: "password" }) ?? "";
  const confirmPassword =
    useWatch({ control: form.control, name: "confirmPassword" }) ?? "";
  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;

  async function onSubmit(values: AcceptInviteValues) {
    try {
      await acceptInvite.mutateAsync({
        token,
        username: values.username,
        password: values.password,
      });
      toast.success("Invite accepted!", {
        description: "Your account is ready. Redirecting…",
      });
      router.push("/");
    } catch {
      toast.error("We couldn't accept this invite. Please try again.");
    }
  }

  if (isLoading) {
    return <InviteSkeleton />;
  }

  if (isError || !invite) {
    return <InvalidInvite />;
  }

  return (
    <div className="w-full max-w-md space-y-7">
      {/* Inviter + role header */}
      <div className="space-y-5 text-center">
        <div className="mx-auto flex w-fit items-center gap-1.5 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" />
          Workspace invitation
        </div>

        <div className="relative mx-auto w-fit">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-chart-4 text-xl font-semibold text-primary-foreground shadow-lg shadow-primary/25 ring-4 ring-card">
            {getInitials(invite.invitedBy.name)}
          </div>
          <div className="absolute -right-2 -bottom-2 flex size-8 items-center justify-center rounded-xl bg-card text-foreground shadow-md ring-1 ring-border">
            <Building2 className="size-4" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-semibold leading-snug tracking-tight">
            <span className="text-primary">{invite.invitedBy.name}</span>{" "}
            invited you to join
            <br />
            <span className="text-foreground">{invite.organization}</span>
          </h1>
          <div className="flex items-center justify-center gap-2 pt-1 text-sm text-muted-foreground">
            <span>You&apos;ll join as</span>
            <RoleBadge role={invite.role} />
          </div>
        </div>
      </div>

      {/* Invited email + expiry meta */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2.5 rounded-xl border bg-muted/40 px-3.5 py-2.5 text-sm">
          <Mail className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate font-medium text-foreground/80">
            {invite.email}
          </span>
          <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
            <Check className="size-3" />
            Verified
          </span>
        </div>
        <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3.5" />
          Invitation expires {formatDate(invite.expiresAt)}
        </p>
      </div>

      {/* Account setup form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      autoComplete="username"
                      placeholder="Choose a username"
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
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Create a password"
                      className="px-9"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <PasswordStrength password={password} />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Re-enter your password"
                      className="pl-9"
                      {...field}
                    />
                    {confirmPassword.length > 0 && (
                      <span className="absolute top-1/2 right-3 -translate-y-1/2">
                        {passwordsMatch ? (
                          <Check className="size-4 text-success" />
                        ) : (
                          <X className="size-4 text-destructive" />
                        )}
                      </span>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={acceptInvite.isPending}
            className="w-full bg-linear-to-r from-primary to-chart-4 shadow-lg shadow-primary/20 transition-shadow hover:shadow-primary/30 hover:brightness-105"
          >
            {acceptInvite.isPending && (
              <Loader2 className="size-4 animate-spin" />
            )}
            {acceptInvite.isPending
              ? "Setting up your account…"
              : "Accept invite"}
          </Button>
        </form>
      </Form>

      <p className="text-center text-xs text-muted-foreground">
        By accepting, you agree to BookLatch&apos;s{" "}
        <span className="font-medium text-foreground/80">Terms</span> and{" "}
        <span className="font-medium text-foreground/80">Privacy Policy</span>.
      </p>
    </div>
  );
}

function PasswordStrength({ password }: { password: string }) {
  const score = useMemo(() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) s++;
    if (/\d/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s; // 0–4
  }, [password]);

  if (!password) return null;

  const labels = ["Weak", "Fair", "Good", "Strong"];
  const colors = ["bg-destructive", "bg-warning", "bg-chart-2", "bg-success"];
  const level = Math.max(0, score - 1);

  return (
    <div className="space-y-1.5 pt-1">
      <div className="flex gap-1.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              i <= level ? colors[level] : "bg-border",
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Password strength:{" "}
        <span className="font-medium text-foreground/80">{labels[level]}</span>
      </p>
    </div>
  );
}

function InviteSkeleton() {
  return (
    <div className="w-full max-w-md space-y-7">
      <div className="flex flex-col items-center gap-3">
        <Skeleton className="size-14 rounded-2xl" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <Skeleton className="h-11 w-full rounded-lg" />
      <div className="space-y-5">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  );
}

function InvalidInvite() {
  return (
    <div className="w-full max-w-md space-y-4 text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertCircle className="size-6" />
      </div>
      <div className="space-y-1.5">
        <h1 className="text-xl font-semibold tracking-tight">
          This invite isn&apos;t valid
        </h1>
        <p className="text-sm text-muted-foreground">
          The invitation may have expired or already been used. Ask your
          workspace admin to send a new one.
        </p>
      </div>
    </div>
  );
}
