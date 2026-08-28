"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, LoaderCircle, LockKeyhole } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useState, useSyncExternalStore } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  googleLoginAction,
  loginAction,
} from "@/features/auth/actions/auth.actions"
import { Link } from "@/i18n/navigation"
import type { Locale } from "@/shared/types/platform"
import { PasswordInput } from "./password-input"

const subscribeToHydration = () => () => undefined

export function LoginForm({ next }: { next?: string }) {
  const t = useTranslations()
  const locale = useLocale() as Locale
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  )
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
    <div className="auth-panel rounded-[30px] p-6 sm:p-9">
      <div className="border-primary/10 bg-primary/6 text-primary flex size-12 items-center justify-center rounded-2xl border">
        <LockKeyhole className="size-5" aria-hidden="true" />
      </div>
      <p className="text-primary mt-5 text-xs font-bold tracking-[0.18em] uppercase">
        {t("auth.portal")}
      </p>
      <h1 className="text-brand-navy mt-2 text-3xl font-bold tracking-[-0.035em] sm:text-[2.15rem]">
        {t("auth.welcome")}
      </h1>
      <p className="text-muted mt-3 max-w-md leading-7">
        {t("auth.loginBody")}
      </p>

      <form
        className="mt-8 space-y-5"
        onSubmit={handleSubmit(submit)}
        noValidate
      >
        {serverError ? (
          <div
            role="alert"
            className="border-danger/20 bg-danger/5 text-danger rounded-xl border p-4 text-sm shadow-[var(--shadow-xs)]"
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
            disabled={!hydrated}
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
            disabled={!hydrated}
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            {...register("password")}
          />
        </Field>
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <label className="text-muted hover:text-brand-navy flex min-h-11 cursor-pointer items-center gap-2 transition-colors">
            <Checkbox disabled={!hydrated} {...register("remember")} />
            {t("auth.remember")}
          </label>
          <Link
            href="/forgot-password"
            className="text-primary font-semibold hover:underline"
          >
            {t("auth.forgot")}
          </Link>
        </div>
        <Button
          className="w-full"
          disabled={!hydrated || isSubmitting || googlePending}
        >
          {isSubmitting ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : null}
          {t("common.login")}{" "}
          <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
        </Button>
      </form>

      <div className="text-muted my-6 flex items-center gap-3 text-xs">
        <span className="bg-line h-px flex-1" />
        <span className="bg-card px-1">{t("auth.separator")}</span>
        <span className="bg-line h-px flex-1" />
      </div>

      <Button
        type="button"
        variant="secondary"
        className="w-full"
        disabled={!hydrated || isSubmitting || googlePending}
        onClick={async () => {
          setGooglePending(true)
          await googleLoginAction(locale, next).catch(() =>
            setGooglePending(false),
          )
        }}
      >
        {googlePending ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : null}
        {t("auth.continueWithGoogle")}
      </Button>

      <p className="text-muted mt-7 text-center text-sm">
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
