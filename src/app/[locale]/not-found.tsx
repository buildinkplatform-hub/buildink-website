import { ArrowLeft, Compass, SearchX } from "lucide-react"
import { getTranslations } from "next-intl/server"

import { BrandLogo } from "@/components/shared/brand-logo"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"

export default async function NotFound() {
  const t = await getTranslations("notFound")
  return (
    <main className="bg-background relative grid min-h-svh place-items-center overflow-hidden p-4 sm:p-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[30rem] bg-[radial-gradient(circle_at_50%_0%,rgb(23_107_255/0.14),transparent_34rem)]" />
      <section className="surface-panel relative w-full max-w-2xl overflow-hidden rounded-[2rem] p-6 text-center shadow-[var(--shadow-floating)] sm:p-10">
        <div className="bg-primary/6 pointer-events-none absolute -end-24 -top-24 size-72 rounded-full blur-3xl" />
        <BrandLogo className="relative mx-auto" />
        <span className="border-primary/10 bg-primary/8 text-primary relative mx-auto mt-8 grid size-14 place-items-center rounded-2xl border">
          <SearchX className="size-6" />
        </span>
        <p className="text-primary relative mt-5 text-xs font-bold tracking-[0.18em] uppercase">
          404 · Page not found
        </p>
        <h1 className="text-foreground relative mt-3 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
          {t("title")}
        </h1>
        <p className="text-muted-foreground relative mx-auto mt-4 max-w-lg text-sm leading-7 sm:text-base">
          {t("body")}
        </p>
        <div className="border-border/80 bg-muted/25 relative mx-auto mt-6 flex max-w-lg items-start gap-3 rounded-2xl border p-4 text-start">
          <span className="bg-card text-primary grid size-9 shrink-0 place-items-center rounded-xl shadow-xs">
            <Compass className="size-4" />
          </span>
          <p className="text-muted-foreground text-xs leading-5">
            The address may have changed or the content is no longer available.
            You can safely return to the discovery experience and continue
            browsing.
          </p>
        </div>
        <div className="relative mt-7 flex flex-col-reverse justify-center gap-2 sm:flex-row">
          <Button asChild variant="secondary">
            <Link href="/">
              <ArrowLeft className="size-4 rtl:rotate-180" />
              {t("action")}
            </Link>
          </Button>
          <Button asChild>
            <Link href="/search">
              <SearchX className="size-4" />
              Search Buildink
            </Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
