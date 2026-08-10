"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2, Link2Off, LoaderCircle } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { PasswordInput } from "@/features/auth/components/password-input"
import { resetPasswordAction } from "@/features/auth/actions/auth.actions"
import { Link } from "@/i18n/navigation"

export function ResetPasswordForm({ validSession }: { validSession: boolean }) {
  const t = useTranslations()
  const [complete, setComplete] = useState(false)
  const passwordRule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
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
      <div className="border-line rounded-2xl border bg-white p-8 text-center shadow-[var(--shadow-card)]">
        <Link2Off className="text-warning mx-auto size-12" />
        <h1 className="text-brand-navy mt-5 text-3xl font-bold">
          {t("auth.resetInvalidTitle")}
        </h1>
        <p className="text-muted mt-3">{t("auth.resetInvalid")}</p>
        <Button asChild className="mt-7">
          <Link href="/forgot-password">{t("auth.forgotTitle")}</Link>
        </Button>
      </div>
    )

  if (complete)
    return (
      <div className="border-line rounded-2xl border bg-white p-8 text-center shadow-[var(--shadow-card)]">
        <CheckCircle2 className="text-success mx-auto size-12" />
        <h1 className="text-brand-navy mt-5 text-3xl font-bold">
          {t("auth.resetSuccessTitle")}
        </h1>
        <p className="text-muted mt-3">{t("auth.resetSuccess")}</p>
        <Button asChild className="mt-7">
          <Link href="/login">{t("common.login")}</Link>
        </Button>
      </div>
    )

  return (
    <div className="border-line rounded-2xl border bg-white p-6 shadow-[var(--shadow-card)] sm:p-9">
      <h1 className="text-brand-navy text-3xl font-bold">
        {t("auth.resetTitle")}
      </h1>
      <p className="text-muted mt-3">{t("auth.resetBody")}</p>
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
