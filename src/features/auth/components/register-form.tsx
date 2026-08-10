"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, LoaderCircle } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { RegistrationActionError } from "@/features/auth/actions/auth-errors"
import {
  googleLoginAction,
  registerAction,
} from "@/features/auth/actions/auth.actions"
import { PasswordInput } from "@/features/auth/components/password-input"
import { Link } from "@/i18n/navigation"
import type { Locale } from "@/shared/types/platform"

export function RegisterForm() {
  const t = useTranslations()
  const locale = useLocale() as Locale
  const [serverError, setServerError] = useState<RegistrationActionError>()
  const [submittedEmail, setSubmittedEmail] = useState("")
  const [cooldownSeconds, setCooldownSeconds] = useState(0)
  const [googlePending, setGooglePending] = useState(false)
  const passwordRule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
  const schema = z
    .object({
      name: z.string().trim().min(2, t("auth.errors.name")),
      email: z.email(t("auth.errors.email")),
      password: z.string().regex(passwordRule, t("auth.errors.password")),
      confirmPassword: z.string(),
      terms: z.boolean().refine(Boolean, t("auth.errors.terms")),
      privacy: z.boolean().refine(Boolean, t("auth.errors.privacy")),
      marketing: z.boolean(),
      preferredLocale: z.literal(locale),
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
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
      privacy: false,
      marketing: false,
      preferredLocale: locale,
    },
  })

  async function submit(values: Values) {
    setServerError(undefined)
    setSubmittedEmail(values.email)
    const result = await registerAction(locale, values)
    if (!result.success) {
      setServerError(result.error ?? "registration_failed")
      if (result.error === "rate_limited")
        setCooldownSeconds(Math.max(1, result.retryAfterSeconds ?? 60))
    }
  }

  const cooldownActive = cooldownSeconds > 0

  useEffect(() => {
    if (!cooldownActive) return
    const timer = window.setInterval(
      () => setCooldownSeconds((current) => Math.max(0, current - 1)),
      1000,
    )
    return () => window.clearInterval(timer)
  }, [cooldownActive])

  const cooldownLabel = `${String(Math.floor(cooldownSeconds / 60)).padStart(2, "0")}:${String(cooldownSeconds % 60).padStart(2, "0")}`

  const canRecoverVerification =
    serverError === "account_exists" ||
    serverError === "email_delivery" ||
    serverError === "email_rate_limited"

  return (
    <div className="border-line rounded-2xl border bg-white p-6 shadow-[var(--shadow-card)] sm:p-9">
      <h1 className="text-brand-navy text-3xl font-bold">
        {t("auth.registerTitle")}
      </h1>
      <p className="text-muted mt-3">{t("auth.registerBody")}</p>
      <form
        className="mt-8 space-y-5"
        onSubmit={handleSubmit(submit)}
        noValidate
      >
        {serverError ? (
          <div
            role="alert"
            className="border-danger/20 bg-danger/5 text-danger rounded-xl border p-4 text-sm leading-6"
          >
            <p>{t(`auth.registerErrors.${serverError}`)}</p>
            {serverError === "rate_limited" && cooldownSeconds > 0 ? (
              <p className="mt-2 font-semibold tabular-nums">
                {t("auth.retryCountdown", { time: cooldownLabel })}
              </p>
            ) : null}
            {canRecoverVerification && submittedEmail ? (
              <Link
                href={`/verify-email?email=${encodeURIComponent(submittedEmail)}`}
                className="mt-2 inline-block font-semibold underline underline-offset-2"
              >
                {t("auth.recoverVerification")}
              </Link>
            ) : null}
          </div>
        ) : null}
        <Field
          label={t("auth.name")}
          htmlFor="name"
          error={errors.name?.message}
          required
        >
          <Input id="name" autoComplete="name" {...register("name")} />
        </Field>
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
        <div className="grid gap-5 sm:grid-cols-2">
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
        </div>
        <label className="text-muted flex cursor-pointer items-start gap-3 text-sm leading-6">
          <input
            type="checkbox"
            className="accent-primary mt-1 size-4 shrink-0"
            {...register("terms")}
          />
          <span>
            {t("auth.terms")} <span className="text-danger">*</span>{" "}
            {errors.terms ? (
              <span className="text-danger block">{errors.terms.message}</span>
            ) : null}
          </span>
        </label>
        <label className="text-muted flex cursor-pointer items-start gap-3 text-sm leading-6">
          <input
            type="checkbox"
            className="accent-primary mt-1 size-4 shrink-0"
            {...register("privacy")}
          />
          <span>
            {t("auth.privacy")} <span className="text-danger">*</span>
            {errors.privacy ? (
              <span className="text-danger block">
                {errors.privacy.message}
              </span>
            ) : null}
          </span>
        </label>
        <label className="text-muted flex cursor-pointer items-start gap-3 text-sm leading-6">
          <input
            type="checkbox"
            className="accent-primary mt-1 size-4 shrink-0"
            {...register("marketing")}
          />
          {t("auth.marketing")}
        </label>
        <Button
          className="w-full"
          disabled={isSubmitting || googlePending || cooldownSeconds > 0}
        >
          {isSubmitting ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : null}
          {cooldownSeconds > 0
            ? t("auth.retryButton", { time: cooldownLabel })
            : t("common.continue")}{" "}
          <ArrowRight className="size-4 rtl:rotate-180" />
        </Button>
      </form>
      <div className="text-muted my-5 flex items-center gap-3 text-xs">
        <span className="bg-line h-px flex-1" />
        <span>or</span>
        <span className="bg-line h-px flex-1" />
      </div>
      <Button
        type="button"
        variant="secondary"
        className="w-full"
        disabled={isSubmitting || googlePending}
        onClick={async () => {
          setGooglePending(true)
          await googleLoginAction(locale).catch(() => setGooglePending(false))
        }}
      >
        {googlePending ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : null}
        Continue with Google
      </Button>
      <p className="text-muted mt-6 text-center text-sm">
        {t("auth.hasAccount")}{" "}
        <Link
          href="/login"
          className="text-primary font-semibold hover:underline"
        >
          {t("common.login")}
        </Link>
      </p>
    </div>
  )
}
