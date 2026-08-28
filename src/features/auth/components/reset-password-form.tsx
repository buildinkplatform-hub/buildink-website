"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2, KeyRound, Link2Off, LoaderCircle } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { resetPasswordAction } from "@/features/auth/actions/auth.actions"
import { PasswordInput } from "@/features/auth/components/password-input"
import { Link } from "@/i18n/navigation"

export function ResetPasswordForm({
  validSession,
  next,
}: {
  validSession: boolean
  next?: string
}) {
  const locale = useLocale()
  const t = useTranslations()
  const [complete, setComplete] = useState(false)
  const passwordRule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
  const safeNext =
    next && next.startsWith("/") && !next.startsWith("//")
      ? next
      : `/${locale}/onboarding/profile-type`
  const schema = z
    .object({
      password: z.string().regex(passwordRule, t("auth.errors.password")),
      confirmPassword: z.string(),
    })
    .refine((value) => value.password === value.confirmPassword, {
      path: ["confirmPassword"],
      message: t("auth.errors.passwordMatch"),
    })
  type Values = z.infer<typeof schema>
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  })

  if (!validSession)
    return (
      <div className="auth-panel rounded-[30px] p-8 text-center sm:p-10">
        <div className="bg-warning/8 border-warning/15 mx-auto flex size-14 items-center justify-center rounded-2xl border">
          <Link2Off className="text-warning size-7" />
        </div>
        <h1 className="text-brand-navy mt-5 text-3xl font-bold tracking-[-0.035em]">
          {t("auth.resetInvalidTitle")}
        </h1>
        <p className="text-muted mx-auto mt-3 max-w-md leading-7">
          {t("auth.resetInvalid")}
        </p>
        <Button asChild className="mt-7">
          <Link href="/forgot-password">{t("auth.forgotTitle")}</Link>
        </Button>
      </div>
    )

  if (complete)
    return (
      <div className="auth-panel rounded-[30px] p-8 text-center sm:p-10">
        <div className="bg-success/8 border-success/15 mx-auto flex size-14 items-center justify-center rounded-2xl border">
          <CheckCircle2 className="text-success size-7" />
        </div>
        <h1 className="text-brand-navy mt-5 text-3xl font-bold tracking-[-0.035em]">
          {t("auth.resetSuccessTitle")}
        </h1>
        <p className="text-muted mx-auto mt-3 max-w-md leading-7">
          {t("auth.resetSuccess")}
        </p>
        <Button asChild className="mt-7">
          <Link href={{ pathname: "/login", query: { next: safeNext } }}>
            {t("common.login")}
          </Link>
        </Button>
      </div>
    )

  return (
    <div className="auth-panel rounded-[30px] p-6 sm:p-9">
      <div className="border-primary/10 bg-primary/6 text-primary flex size-12 items-center justify-center rounded-2xl border">
        <KeyRound className="size-5" />
      </div>
      <h1 className="text-brand-navy mt-5 text-3xl font-bold tracking-[-0.035em]">
        {t("auth.resetTitle")}
      </h1>
      <p className="text-muted mt-3 max-w-md leading-7">
        {t("auth.resetBody")}
      </p>
      <form
        className="mt-8 space-y-5"
        onSubmit={handleSubmit(async (values) => {
          const result = await resetPasswordAction(values)
          if (result.success) setComplete(true)
        })}
      >
        <Field
          label={t("auth.password")}
          htmlFor="password"
          error={errors.password?.message}
          hint={t("auth.passwordHint")}
          required
        >
          <PasswordInput
            id="password"
            autoComplete="new-password"
            {...register("password")}
          />
        </Field>
        <Field
          label={t("auth.confirmPassword")}
          htmlFor="confirmPassword"
          error={errors.confirmPassword?.message}
          required
        >
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            {...register("confirmPassword")}
          />
        </Field>
        <Button className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : null}
          {t("auth.updatePassword")}
        </Button>
      </form>
    </div>
  )
}
