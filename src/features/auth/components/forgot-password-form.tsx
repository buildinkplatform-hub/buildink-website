"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2, LoaderCircle, Mail } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { forgotPasswordAction } from "@/features/auth/actions/auth.actions"
import { Link } from "@/i18n/navigation"
import type { Locale } from "@/shared/types/platform"

export function ForgotPasswordForm() {
  const t = useTranslations()
  const locale = useLocale() as Locale
  const [sent, setSent] = useState(false)
  const schema = z.object({ email: z.email(t("auth.errors.email")) })
  type Values = z.infer<typeof schema>
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  })

  if (sent) {
    return (
      <div className="auth-panel rounded-[30px] p-8 text-center sm:p-10">
        <div className="bg-success/8 border-success/15 mx-auto flex size-14 items-center justify-center rounded-2xl border">
          <CheckCircle2 className="text-success size-7" aria-hidden="true" />
        </div>
        <h1 className="text-brand-navy mt-5 text-3xl font-bold tracking-[-0.035em]">
          {t("auth.forgotSuccessTitle")}
        </h1>
        <p className="text-muted mx-auto mt-3 max-w-md leading-7">
          {t("auth.forgotSuccess")}
        </p>
        <Button asChild variant="secondary" className="mt-7">
          <Link href="/login">{t("common.login")}</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="auth-panel rounded-[30px] p-6 sm:p-9">
      <div className="border-primary/10 bg-primary/6 text-primary flex size-12 items-center justify-center rounded-2xl border">
        <Mail className="size-5" aria-hidden="true" />
      </div>
      <h1 className="text-brand-navy mt-6 text-3xl font-bold tracking-[-0.035em]">
        {t("auth.forgotTitle")}
      </h1>
      <p className="text-muted mt-3 max-w-md leading-7">
        {t("auth.forgotBody")}
      </p>
      <form
        className="mt-8 space-y-5"
        onSubmit={handleSubmit(async ({ email }) => {
          await forgotPasswordAction(email, locale)
          setSent(true)
        })}
        noValidate
      >
        <Field
          label={t("auth.email")}
          htmlFor="email"
          error={errors.email?.message}
          required
        >
          <Input
            id="email"
            type="email"
            autoComplete="email"
            className="ltr-content"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
          />
        </Field>
        <Button className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : null}
          {t("auth.sendReset")}
        </Button>
      </form>
      <p className="mt-7 text-center text-sm">
        <Link
          href="/login"
          className="text-primary font-semibold hover:underline"
        >
          {t("common.back")}
        </Link>
      </p>
    </div>
  )
}
