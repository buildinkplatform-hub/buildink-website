"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2, LoaderCircle, Mail } from "lucide-react"
import { useTranslations } from "next-intl"
import { useLocale } from "next-intl"
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
      <div className="border-line rounded-2xl border bg-white p-8 text-center shadow-[var(--shadow-card)]">
        <CheckCircle2
          className="text-success mx-auto size-12"
          aria-hidden="true"
        />
        <h1 className="text-brand-navy mt-5 text-3xl font-bold">
          {t("auth.forgotSuccessTitle")}
        </h1>
        <p className="text-muted mt-3 leading-7">{t("auth.forgotSuccess")}</p>
        <Button asChild variant="secondary" className="mt-7">
          <Link href="/login">{t("common.login")}</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="border-line rounded-2xl border bg-white p-6 shadow-[var(--shadow-card)] sm:p-9">
      <div className="bg-light-blue text-primary flex size-12 items-center justify-center rounded-xl">
        <Mail className="size-6" />
      </div>
      <h1 className="text-brand-navy mt-6 text-3xl font-bold">
        {t("auth.forgotTitle")}
      </h1>
      <p className="text-muted mt-3">{t("auth.forgotBody")}</p>
      <form
        className="mt-8 space-y-5"
        onSubmit={handleSubmit(async ({ email }) => {
          await forgotPasswordAction(email, locale)
          setSent(true)
        })}
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
      <p className="mt-6 text-center text-sm">
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
