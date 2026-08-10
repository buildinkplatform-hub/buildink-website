import { getTranslations } from "next-intl/server"

import { BrandLogo } from "@/components/shared/brand-logo"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"

export default async function NotFound() {
  const t = await getTranslations("notFound")
  return (
    <main className="bg-canvas grid min-h-screen place-items-center p-6 text-center">
      <div className="max-w-md">
        <BrandLogo className="mx-auto" />
        <p className="text-primary mt-10 text-sm font-bold tracking-widest">
          404
        </p>
        <h1 className="text-brand-navy mt-3 text-3xl font-bold">
          {t("title")}
        </h1>
        <p className="text-muted mt-4">{t("body")}</p>
        <Button asChild className="mt-8">
          <Link href="/">{t("action")}</Link>
        </Button>
      </div>
    </main>
  )
}
