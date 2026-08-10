import { z } from "zod"

import { locales } from "@/shared/types/platform"

const strongPassword = z
  .string()
  .min(8)
  .regex(/[A-Z]/)
  .regex(/[a-z]/)
  .regex(/[0-9]/)
  .regex(/[^A-Za-z0-9]/)

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
  remember: z.boolean().default(false),
  next: z.string().optional(),
})

export const registerSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    email: z.email(),
    password: strongPassword,
    confirmPassword: z.string(),
    terms: z.boolean().refine(Boolean),
    privacy: z.boolean().refine(Boolean),
    marketing: z.boolean().default(false),
    preferredLocale: z.enum(locales),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
  })

export const forgotPasswordSchema = z.object({ email: z.email() })
export const resetPasswordSchema = z
  .object({ password: strongPassword, confirmPassword: z.string() })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
  })

export type LoginInput = z.input<typeof loginSchema>
export type RegisterInput = z.input<typeof registerSchema>
export type ResetPasswordInput = z.input<typeof resetPasswordSchema>
