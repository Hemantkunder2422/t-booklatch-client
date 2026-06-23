import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean(),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const acceptInviteSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be 30 characters or fewer")
      .regex(
        /^[a-zA-Z0-9_.-]+$/,
        "Use only letters, numbers, and . _ - characters",
      ),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Include at least one lowercase letter")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type AcceptInviteValues = z.infer<typeof acceptInviteSchema>;
