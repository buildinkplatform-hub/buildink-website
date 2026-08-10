"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, LoaderCircle } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Link } from "@/i18n/navigation"
import { googleLoginAction, loginAction } from "@/features/auth/actions/auth.actions"
import { PasswordInput } from "./password-input"
import type { Locale } from "@/shared/types/platform"

export function LoginForm({ next }: { next?: string }) {
  const t = useTranslations()
  const locale = useLocale() as Locale
  const [serverError, setServerError] = useState(false)
  const [googlePending, setGooglePending] = useState(false)
  const schema = z.object({
    email: z.email(t("auth.errors.email")),
    password: z.string().min(1, t("auth.errors.password")),
    remember: z.boolean(),
  })
  type FormValues = z.infer<typeof schema>
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", remember: false },
  })

  async function submit(values: FormValues) {
    setServerError(false)
    const result = await loginAction(locale, { ...values, next })
    if (!result.success) setServerError(true)
  }

  return (
    <div className="border-line rounded-2xl border bg-white p-6 shadow-[var(--shadow-card)] sm:p-9">
      <p className="text-primary text-sm font-bold tracking-widest uppercase">
        Buildink portal
      </p>
      <h1 className="text-brand-navy mt-3 text-3xl font-bold">
        {t("auth.welcome")}
      </h1>
      <p className="text-muted mt-3">{t("auth.loginBody")}</p>
      <form
        className="mt-8 space-y-5"
        onSubmit={handleSubmit(submit)}
        noValidate
      >
        {serverError ? (
          <div
            role="alert"
            className="border-danger/20 bg-danger/5 text-danger rounded-xl border p-4 text-sm"
          >
            {t("auth.invalid")}
          </div>
        ) : null}
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
            inputMode="email"
            className="ltr-content"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
        </Field>
        <Field
          label={t("auth.password")}
          htmlFor="password"
          error={errors.password?.message}
          required
        >
          <PasswordInput
            id="password"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            {...register("password")}
          />
        </Field>
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <label className="text-muted flex min-h-11 cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              className="accent-primary size-4"
              {...register("remember")}
            />
            {t("auth.remember")}
          </label>
          <Link
            href="/forgot-password"
            className="text-primary font-semibold hover:underline"
          >
            {t("auth.forgot")}
          </Link>
        </div>
        <Button className="w-full" disabled={isSubmitting || googlePending}>
          {isSubmitting ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : null}
          {t("common.login")}{" "}
          <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
        </Button>
      </form>
      <div className="my-5 flex items-center gap-3 text-xs text-muted"><span className="h-px flex-1 bg-line" /><span>or</span><span className="h-px flex-1 bg-line" /></div>
      <Button
        type="button"
        variant="secondary"
        className="w-full"
        disabled={isSubmitting || googlePending}
        onClick={async () => {
          setGooglePending(true)
          await googleLoginAction(locale, next).catch(() => setGooglePending(false))
        }}
      >
        {googlePending ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : null}
        Continue with Google
      </Button>
      <p className="text-muted mt-6 text-center text-sm">
        {t("auth.noAccount")}{" "}
        <Link
          href="/register"
          className="text-primary font-semibold hover:underline"
        >
          {t("common.register")}
        </Link>
      </p>
    </div>
  )
}
