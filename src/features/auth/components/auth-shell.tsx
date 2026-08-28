import { BadgeCheck, HardHat, LockKeyhole, ShieldCheck } from "lucide-react"
import { getTranslations } from "next-intl/server"

import { BrandLogo } from "@/components/shared/brand-logo"
import { LocaleSwitcher } from "@/components/shared/locale-switcher"
import { Link } from "@/i18n/navigation"

export async function AuthShell({ children }: { children: React.ReactNode }) {
  const t = await getTranslations()

  return (
    <main
      id="main-content"
      className="auth-grid bg-canvas relative min-h-screen overflow-hidden lg:grid lg:grid-cols-[minmax(360px,0.88fr)_minmax(0,1.12fr)]"
    >
      <section className="bg-brand-navy relative hidden overflow-hidden p-10 text-white lg:flex lg:flex-col xl:p-14">
        <div className="section-grid pointer-events-none absolute inset-0 opacity-25" />
        <div className="bg-primary/28 pointer-events-none absolute -end-28 -top-28 size-96 rounded-full blur-3xl" />
        <div className="bg-interactive/12 pointer-events-none absolute -start-24 -bottom-32 size-96 rounded-full blur-3xl" />

        <Link
          href="/"
          className="relative z-10 w-fit rounded-2xl border border-white/10 bg-white p-2 shadow-[0_18px_50px_rgba(0,0,0,0.18)]"
        >
          <BrandLogo />
        </Link>

        <div className="relative z-10 my-auto max-w-lg py-12">
          <div className="border-interactive/20 bg-primary/15 text-interactive inline-flex size-14 items-center justify-center rounded-2xl border shadow-[0_12px_28px_rgba(23,107,255,0.16)]">
            <LockKeyhole className="size-7" aria-hidden="true" />
          </div>
          <h1 className="mt-7 max-w-md text-4xl leading-[1.08] font-bold tracking-[-0.045em] xl:text-5xl">
            {t("public.trustTitle")}
          </h1>
          <p className="mt-5 max-w-md text-base leading-8 text-white/68 xl:text-lg">
            {t("public.trustBody")}
          </p>

          <div
            className="mt-9 grid max-w-md grid-cols-3 gap-3"
            aria-hidden="true"
          >
            {[ShieldCheck, HardHat, BadgeCheck].map((Icon, index) => (
              <div
                key={index}
                className="flex min-h-20 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] backdrop-blur-sm"
              >
                <Icon className="text-interactive size-6" />
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-white/45">
          {t("public.copyright")}
        </p>
      </section>

      <section className="relative flex min-h-screen flex-col bg-[radial-gradient(circle_at_top_right,rgba(23,107,255,.08),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(49,181,255,.06),transparent_30%)]">
        <div className="section-grid pointer-events-none absolute inset-0 opacity-45" />
        <header className="relative z-10 flex min-h-18 items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link href="/" className="rounded-xl lg:hidden">
            <BrandLogo />
          </Link>
          <div className="ms-auto">
            <LocaleSwitcher />
          </div>
        </header>
        <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-8 sm:px-8 sm:py-12 lg:px-10">
          <div className="w-full max-w-lg has-[[data-onboarding-frame]]:max-w-3xl">
            {children}
          </div>
        </div>
      </section>
    </main>
  )
}
