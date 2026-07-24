"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { BookLatchLogo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { ApiError } from "@/types/api";
import { DEV_LOGIN_ENABLED, DEV_USER } from "./dev-login";
import { loginSchema, type LoginValues } from "./schema";
import { useSignin } from "./use-auth";

/** Same-origin relative path only — blocks `//evil.com` open redirects. */
function safeNext(next: string | null): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { mutateAsync: signin, isPending } = useSignin();
  const setAuth = useAuthStore.use.setAuth();

  function handleDevLogin() {
    setAuth(DEV_USER);
    toast.success("Dev bypass", {
      description: "Signed in with a local dev account.",
    });
    const next = new URLSearchParams(window.location.search).get("next");
    router.push(safeNext(next));
  }
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: true },
  });

  async function onSubmit(values: LoginValues) {
    try {
      const user = await signin({
        email: values.email,
        password: values.password,
      });
      toast.success("Welcome back!", {
        description: `Signed in as ${user.email}. Redirecting…`,
      });
      const next = new URLSearchParams(window.location.search).get("next");
      router.push(next?.startsWith("/") ? next : "/");
    } catch (error) {
      const apiError = error as ApiError;
      const fields = apiError.fieldErrors ?? {};
      for (const key of ["email", "password"] as const) {
        if (fields[key]?.length) {
          form.setError(key, { message: fields[key][0] });
        }
      }
      toast.error(apiError.message ?? "Couldn't sign you in. Please try again.");
    }
  }

  const isSubmitting = isPending;

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-muted/20">
      <CardHeader className="space-y-2 text-center pb-8 pt-8">
        <BookLatchLogo className="lg:hidden mx-auto mb-4" textClassName="text-base" />
        <CardTitle className="text-3xl font-bold tracking-tight">Welcome back</CardTitle>
        <CardDescription className="text-base">
          Sign in to your venue management workspace.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
                      autoComplete="email"
                      placeholder="you@company.com"
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
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter your password"
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
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="remember"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <Label
                  htmlFor={field.name}
                  className="font-normal text-muted-foreground"
                >
                  Keep me signed in
                </Label>
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full h-11 text-base font-medium mt-4" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-5 animate-spin mr-2" />}
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </Form>
      </CardContent>

      <CardFooter className="flex flex-col gap-6 pb-8">
        <div className="flex items-center gap-3 w-full">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground uppercase font-medium">OR</span>
          <Separator className="flex-1" />
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full h-11"
          onClick={() => toast.info("SSO is not wired up in this demo.")}
        >
          <GoogleIcon className="size-5 mr-2" />
          Continue with Google
        </Button>

        <p className="text-center text-sm text-muted-foreground mt-2">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-primary hover:underline transition-colors"
          >
            Start free trial
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}
