import { LockKeyhole } from "lucide-react"
import { getTranslations } from "next-intl/server"

import { BrandLogo } from "@/components/shared/brand-logo"
import { LocaleSwitcher } from "@/components/shared/locale-switcher"
import { Link } from "@/i18n/navigation"

export async function AuthShell({ children }: { children: React.ReactNode }) {
  const t = await getTranslations()
  return (
    <main
      id="main-content"
      className="auth-grid bg-canvas min-h-screen lg:grid lg:grid-cols-[minmax(320px,0.75fr)_1.25fr]"
    >
      <section className="bg-brand-navy relative hidden overflow-hidden p-12 text-white lg:flex lg:flex-col">
        <div className="bg-primary/25 absolute -end-28 -top-28 size-80 rounded-full blur-3xl" />
        <Link href="/" className="relative w-fit rounded-xl bg-white p-2">
          <BrandLogo />
        </Link>
        <div className="relative my-auto max-w-md">
          <div className="bg-primary/20 text-interactive flex size-14 items-center justify-center rounded-2xl">
            <LockKeyhole className="size-7" aria-hidden="true" />
          </div>
          <h1 className="mt-7 text-4xl leading-tight font-bold">
            {t("public.trustTitle")}
          </h1>
          <p className="mt-4 text-lg leading-8 text-white/65">
            {t("public.trustBody")}
          </p>
        </div>
        <p className="relative text-xs text-white/45">
          {t("public.copyright")}
        </p>
      </section>
      <section className="flex min-h-screen flex-col">
        <header className="flex min-h-18 items-center justify-between px-5 sm:px-8">
          <Link href="/" className="lg:hidden">
            <BrandLogo />
          </Link>
          <div className="ms-auto">
            <LocaleSwitcher />
          </div>
        </header>
        <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
          <div className="w-full max-w-lg has-[[data-onboarding-frame]]:max-w-2xl">
            {children}
          </div>
        </div>
      </section>
    </main>
  )
}
